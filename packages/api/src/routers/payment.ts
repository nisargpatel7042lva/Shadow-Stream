import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { requirePermission, requireOrgMembership } from '../middleware/permission'
import { getNextBatchNumber, logActivity } from '@shadowstream/database'
import { PublicKey, Keypair } from '@solana/web3.js'

export const paymentRouter = router({
  /**
   * Create a new payment batch
   */
  createBatch: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        title: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        recipients: z
          .array(
            z.object({
              walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
              amount: z.number().positive().max(1000000),
              memo: z.string().max(200).optional(),
            })
          )
          .min(1)
          .max(50),
        tokenMint: z.string().optional(),
        isPrivate: z.boolean().default(true),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check permissions
      await requirePermission(userId, input.organizationId, 'createBatch')

      // Get organization
      const org = await ctx.db.organization.findUnique({
        where: { id: input.organizationId },
      })

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      // Calculate total
      const totalAmount = input.recipients.reduce((sum, r) => sum + r.amount, 0)

      // Get next batch number
      const batchNumber = await getNextBatchNumber(input.organizationId)

      // Create batch
      const batch = await ctx.db.paymentBatch.create({
        data: {
          organizationId: input.organizationId,
          batchNumber,
          title: input.title,
          description: input.description,
          totalAmount,
          recipientCount: input.recipients.length,
          tokenMint: input.tokenMint,
          isPrivate: input.isPrivate,
          status: 'PENDING',
          createdBy: userId,
          scheduledFor: input.scheduledFor,
        },
      })

      // Encrypt if private
      let encryptedData = null
      let merkleRoot = null

      if (input.isPrivate) {
        // Get sender keypair (in production, get from session/wallet)
        const senderKeypair = Keypair.generate() // TODO: Get from session

        const encrypted = await ctx.privacyService.encryptBatch({
          recipients: input.recipients.map((r) => ({
            publicKey: new PublicKey(r.walletAddress),
            amount: r.amount,
            memo: r.memo,
          })),
          senderKeypair,
          protocol: 'custom-zk',
        })

        encryptedData = encrypted
        merkleRoot = encrypted.merkleRoot

        // Update batch with encrypted data
        await ctx.db.paymentBatch.update({
          where: { id: batch.id },
          data: {
            encryptedData: encryptedData as any,
            merkleRoot,
            privacyProtocol: 'custom-zk',
          },
        })
      }

      // Create payments
      const payments = await Promise.all(
        input.recipients.map(async (recipient, idx) => {
          const paymentData: any = {
            batchId: batch.id,
            recipientId: recipient.walletAddress,
            amount: recipient.amount,
            tokenMint: input.tokenMint,
            memo: recipient.memo,
            status: 'PENDING',
          }

          // Add privacy fields if private
          if (input.isPrivate && encryptedData) {
            paymentData.encryptedData = encryptedData.payments[idx].encryptedData
            paymentData.nonce = encryptedData.payments[idx].nonce
            paymentData.commitment = encryptedData.payments[idx].commitment
          }

          return ctx.db.payment.create({
            data: paymentData,
          })
        })
      )

      // Log activity
      await logActivity({
        userId,
        action: 'batch.created',
        entityType: 'PaymentBatch',
        entityId: batch.id,
        metadata: {
          recipientCount: input.recipients.length,
          totalAmount,
          isPrivate: input.isPrivate,
        },
      })

      return {
        success: true,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        status: batch.status,
        totalAmount,
      }
    }),

  /**
   * Execute a payment batch
   */
  executeBatch: protectedProcedure
    .input(
      z.object({
        batchId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Get batch
      const batch = await ctx.db.paymentBatch.findUnique({
        where: { id: input.batchId },
        include: {
          payments: true,
          organization: true,
        },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      // Verify status
      if (batch.status !== 'APPROVED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot execute batch with status: ${batch.status}`,
        })
      }

      // Check permissions
      await requirePermission(userId, batch.organizationId, 'executeBatch')

      // Update status to EXECUTING
      await ctx.db.paymentBatch.update({
        where: { id: batch.id },
        data: { status: 'EXECUTING' },
      })

      try {
        // TODO: Execute on Solana
        // const signature = await ctx.solanaService.executeBatch({...})
        const signature = 'mock_signature_' + Date.now()

        // Update batch as completed
        await ctx.db.paymentBatch.update({
          where: { id: batch.id },
          data: {
            status: 'COMPLETED',
            signature,
            executedAt: new Date(),
          },
        })

        // Update payments
        await ctx.db.payment.updateMany({
          where: { batchId: batch.id },
          data: {
            status: 'COMPLETED',
            processedAt: new Date(),
          },
        })

        // Log activity
        await logActivity({
          userId,
          action: 'batch.executed',
          entityType: 'PaymentBatch',
          entityId: batch.id,
          metadata: { signature },
        })

        return {
          success: true,
          signature,
          batchId: batch.id,
        }
      } catch (error: any) {
        // Handle execution failure
        await ctx.db.paymentBatch.update({
          where: { id: batch.id },
          data: { status: 'FAILED' },
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Batch execution failed: ${error.message}`,
        })
      }
    }),

  /**
   * Get batch by ID
   */
  getBatchById: protectedProcedure
    .input(
      z.object({
        batchId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const batch = await ctx.db.paymentBatch.findUnique({
        where: { id: input.batchId },
        include: {
          payments: {
            include: {
              recipient: {
                select: {
                  id: true,
                  walletAddress: true,
                  name: true,
                },
              },
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              vaultAddress: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
            },
          },
        },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      // Check access
      await requireOrgMembership(userId, batch.organizationId)

      return batch
    }),

  /**
   * List batches for an organization
   */
  listBatches: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().cuid(),
        status: z
          .enum([
            'PENDING',
            'APPROVED',
            'EXECUTING',
            'COMPLETED',
            'FAILED',
            'CANCELLED',
          ])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      // Check membership
      await requireOrgMembership(userId, input.organizationId)

      const batches = await ctx.db.paymentBatch.findMany({
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
        include: {
          _count: {
            select: { payments: true },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (batches.length > input.limit) {
        const nextItem = batches.pop()
        nextCursor = nextItem!.id
      }

      return {
        batches,
        nextCursor,
      }
    }),

  /**
   * Approve a batch
   */
  approveBatch: protectedProcedure
    .input(
      z.object({
        batchId: z.string().cuid(),
        approved: z.boolean(),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const batch = await ctx.db.paymentBatch.findUnique({
        where: { id: input.batchId },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      // Check permission
      await requirePermission(userId, batch.organizationId, 'approveBatch')

      // Create approval record
      await ctx.db.batchApproval.create({
        data: {
          batchId: input.batchId,
          approverId: userId,
          approved: input.approved,
          comment: input.comment,
        },
      })

      // Update batch status
      if (input.approved) {
        await ctx.db.paymentBatch.update({
          where: { id: input.batchId },
          data: {
            status: 'APPROVED',
            approvedBy: userId,
            approvedAt: new Date(),
          },
        })
      } else {
        await ctx.db.paymentBatch.update({
          where: { id: input.batchId },
          data: { status: 'CANCELLED' },
        })
      }

      return { success: true }
    }),

  /**
   * Cancel a batch
   */
  cancelBatch: protectedProcedure
    .input(
      z.object({
        batchId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id

      const batch = await ctx.db.paymentBatch.findUnique({
        where: { id: input.batchId },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      if (batch.status === 'COMPLETED' || batch.status === 'EXECUTING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel executed or executing batch',
        })
      }

      // Check permission (creator or admin)
      const isCreator = batch.createdBy === userId
      const isAdmin = await ctx.db.organizationMember.findFirst({
        where: {
          userId,
          organizationId: batch.organizationId,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!isCreator && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the creator or admin can cancel this batch',
        })
      }

      await ctx.db.paymentBatch.update({
        where: { id: input.batchId },
        data: {
          status: 'CANCELLED',
        },
      })

      return { success: true }
    }),
})
