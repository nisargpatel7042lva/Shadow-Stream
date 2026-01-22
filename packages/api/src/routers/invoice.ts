import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { requireOrgMembership, requireOrgAdmin } from '../middleware/permission'

export const invoiceRouter = router({
  /**
   * Create a new invoice
   */
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        title: z.string().min(1).max(100),
        amount: z.number().positive(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check membership
      await requireOrgMembership(userId, input.organizationId)

      const invoice = await ctx.db.invoice.create({
        data: {
          organizationId: input.organizationId,
          title: input.title,
          amount: input.amount,
          status: 'DRAFT',
          dueDate: input.dueDate,
        },
      })

      return {
        success: true,
        invoice,
      }
    }),

  /**
   * Get invoice by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      // Check membership
      await requireOrgMembership(userId, invoice.organizationId)

      return invoice
    }),

  /**
   * List invoices for an organization
   */
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check membership
      await requireOrgMembership(userId, input.organizationId)

      const invoices = await ctx.db.invoice.findMany({
        where: {
          organizationId: input.organizationId,
          ...(input.status && { status: input.status }),
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
      })

      let nextCursor: string | undefined
      if (invoices.length > input.limit) {
        const nextItem = invoices.pop()
        nextCursor = nextItem!.id
      }

      return {
        invoices,
        nextCursor,
      }
    }),

  /**
   * Update invoice
   */
  update: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
        title: z.string().min(1).max(100).optional(),
        amount: z.number().positive().optional(),
        dueDate: z.date().optional(),
        status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      // Check membership
      await requireOrgMembership(userId, invoice.organizationId)

      // Only allow status changes if admin
      if (input.status && input.status !== invoice.status) {
        await requireOrgAdmin(userId, invoice.organizationId)
      }

      const updated = await ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.amount && { amount: input.amount }),
          ...(input.dueDate && { dueDate: input.dueDate }),
          ...(input.status && { status: input.status }),
          ...(input.status === 'PAID' && !invoice.paidAt && { paidAt: new Date() }),
        },
      })

      return { success: true, invoice: updated }
    }),

  /**
   * Delete invoice
   */
  delete: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      // Check admin access
      await requireOrgAdmin(userId, invoice.organizationId)

      // Only allow deletion of DRAFT invoices
      if (invoice.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only delete draft invoices',
        })
      }

      await ctx.db.invoice.delete({
        where: { id: input.invoiceId },
      })

      return { success: true }
    }),
})
