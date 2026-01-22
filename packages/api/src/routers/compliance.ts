import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { requireOrgAdmin } from '../middleware/permission'

export const complianceRouter = router({
  /**
   * Get activity logs for an organization
   */
  getActivityLogs: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check admin access
      await requireOrgAdmin(userId, input.organizationId)

      // Get organization members
      const members = await ctx.db.organizationMember.findMany({
        where: { organizationId: input.organizationId },
        select: { userId: true },
      })

      const memberIds = members.map((m) => m.userId)

      const logs = await ctx.db.activityLog.findMany({
        where: {
          userId: { in: memberIds },
          ...(input.action && { action: input.action }),
          ...(input.entityType && { entityType: input.entityType }),
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          // Note: User relation would need to be added to ActivityLog model
        },
      })

      let nextCursor: string | undefined
      if (logs.length > input.limit) {
        const nextItem = logs.pop()
        nextCursor = nextItem!.id
      }

      return {
        logs,
        nextCursor,
      }
    }),

  /**
   * Get batch approvals for an organization
   */
  getBatchApprovals: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        batchId: z.string().cuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check admin access
      await requireOrgAdmin(userId, input.organizationId)

      const approvals = await ctx.db.batchApproval.findMany({
        where: {
          ...(input.batchId && { batchId: input.batchId }),
          batch: {
            organizationId: input.organizationId,
          },
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
              batchNumber: true,
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (approvals.length > input.limit) {
        const nextItem = approvals.pop()
        nextCursor = nextItem!.id
      }

      return {
        approvals,
        nextCursor,
      }
    }),

  /**
   * Generate compliance report
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check admin access
      await requireOrgAdmin(userId, input.organizationId)

      // Get batches in date range
      const batches = await ctx.db.paymentBatch.findMany({
        where: {
          organizationId: input.organizationId,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          payments: true,
          creator: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
            },
          },
        },
      })

      // Calculate statistics
      const totalBatches = batches.length
      const completedBatches = batches.filter((b) => b.status === 'COMPLETED').length
      const totalAmount = batches.reduce((sum, b) => sum + Number(b.totalAmount), 0)
      const totalPayments = batches.reduce((sum, b) => sum + b.payments.length, 0)
      const privateBatches = batches.filter((b) => b.isPrivate).length

      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        statistics: {
          totalBatches,
          completedBatches,
          pendingBatches: batches.filter((b) => b.status === 'PENDING').length,
          cancelledBatches: batches.filter((b) => b.status === 'CANCELLED').length,
          totalAmount,
          totalPayments,
          privateBatches,
          publicBatches: totalBatches - privateBatches,
        },
        batches: batches.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          title: b.title,
          status: b.status,
          totalAmount: Number(b.totalAmount),
          recipientCount: b.recipientCount,
          isPrivate: b.isPrivate,
          createdAt: b.createdAt,
          executedAt: b.executedAt,
          creator: b.creator,
        })),
      }
    }),
})
