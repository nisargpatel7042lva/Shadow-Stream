import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { requireOrgMembership, requireOrgAdmin } from '../middleware/permission'
import { getOrganizationStats } from '@shadowstream/database'
import { Keypair } from '@solana/web3.js'

export const organizationRouter = router({
  /**
   * Create a new organization
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        vaultAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Generate vault address if not provided
      const vaultAddress = input.vaultAddress || Keypair.generate().publicKey.toBase58()

      // Create organization
      const org = await ctx.db.organization.create({
        data: {
          name: input.name,
          vaultAddress,
        },
      })

      // Add creator as owner
      await ctx.db.organizationMember.create({
        data: {
          organizationId: org.id,
          userId,
          role: 'OWNER',
          canCreateBatch: true,
          canApproveBatch: true,
          canExecuteBatch: true,
        },
      })

      return {
        success: true,
        organization: org,
      }
    }),

  /**
   * Get organization by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check membership
      await requireOrgMembership(userId, input.organizationId)

      const org = await ctx.db.organization.findUnique({
        where: { id: input.organizationId },
        include: {
          _count: {
            select: {
              members: true,
              batches: true,
              invoices: true,
            },
          },
        },
      })

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      return org
    }),

  /**
   * List user's organizations
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id

    const memberships = await ctx.db.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                batches: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return memberships.map((m: any) => ({
      ...(m.organization as Record<string, any>),
      role: m.role,
      permissions: {
        canCreateBatch: m.canCreateBatch,
        canApproveBatch: m.canApproveBatch,
        canExecuteBatch: m.canExecuteBatch,
      },
    }))
  }),

  /**
   * Get organization statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check membership
      await requireOrgMembership(userId, input.organizationId)

      return await getOrganizationStats(input.organizationId)
    }),

  /**
   * Update organization
   */
  update: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        name: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check admin access
      await requireOrgAdmin(userId, input.organizationId)

      const org = await ctx.db.organization.update({
        where: { id: input.organizationId },
        data: {
          ...(input.name && { name: input.name }),
        },
      })

      return { success: true, organization: org }
    }),

  /**
   * Add member to organization
   */
  addMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        userId: z.string().cuid(),
        role: z.enum(['OWNER', 'ADMIN', 'FINANCE', 'CONTRACTOR']),
        canCreateBatch: z.boolean().default(false),
        canApproveBatch: z.boolean().default(false),
        canExecuteBatch: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session!.user.id

      // Check admin access
      await requireOrgAdmin(currentUserId, input.organizationId)

      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Create or update membership
      const member = await ctx.db.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: input.userId,
          },
        },
        create: {
          organizationId: input.organizationId,
          userId: input.userId,
          role: input.role,
          canCreateBatch: input.canCreateBatch,
          canApproveBatch: input.canApproveBatch,
          canExecuteBatch: input.canExecuteBatch,
        },
        update: {
          role: input.role,
          canCreateBatch: input.canCreateBatch,
          canApproveBatch: input.canApproveBatch,
          canExecuteBatch: input.canExecuteBatch,
        },
      })

      return { success: true, member }
    }),

  /**
   * Remove member from organization
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session!.user.id

      // Check admin access
      await requireOrgAdmin(currentUserId, input.organizationId)

      // Don't allow removing yourself
      if (input.userId === currentUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove yourself from organization',
        })
      }

      await ctx.db.organizationMember.delete({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  /**
   * List organization members
   */
  listMembers: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check membership
      await requireOrgMembership(userId, input.organizationId)

      const members = await ctx.db.organizationMember.findMany({
        where: { organizationId: input.organizationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
              email: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'asc' },
        ],
      })

      return members
    }),
})
