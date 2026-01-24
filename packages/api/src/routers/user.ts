import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { getOrCreateUser, getUserByWallet } from '@shadowstream/database'

export const userRouter = router({
  /**
   * Get current user
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            organizations: true,
            createdBatches: true,
            payments: true,
          },
        },
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return user
  }),

  /**
   * Get user by wallet address
   */
  getByWallet: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await getUserByWallet(input.walletAddress)

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        name: user.name,
        // Don't expose email publicly
      }
    }),

  /**
   * Create or get user by wallet
   */
  getOrCreate: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getOrCreateUser(input.walletAddress, {
        name: input.name,
        email: input.email,
      })

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        name: user.name,
        email: user.email,
      }
    }),

  /**
   * Update user profile
   */
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
        },
      })

      return {
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.email,
        },
      }
    }),

  /**
   * Get user's payment history
   */
  getPayments: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const payments = await ctx.db.payment.findMany({
        where: {
          recipientId: user.walletAddress,
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          batch: {
            select: {
              id: true,
              title: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (payments.length > input.limit) {
        const nextItem = payments.pop()
        nextCursor = nextItem!.id
      }

      return {
        payments,
        nextCursor,
      }
    }),
})
