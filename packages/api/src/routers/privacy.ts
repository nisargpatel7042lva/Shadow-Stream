import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { PrivacyManager } from '@shadowstream/sdk'
import { PublicKey, Keypair } from '@solana/web3.js'

const privacyManager = new PrivacyManager()

export const privacyRouter = router({
  /**
   * Decrypt payment for recipient
   */
  decryptPayment: protectedProcedure
    .input(
      z.object({
        batchId: z.string().cuid(),
        recipientWalletAddress: z.string(),
        recipientPrivateKey: z.string(), // Base58 encoded private key
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get payment from database
      const payment = await ctx.db.payment.findFirst({
        where: {
          batchId: input.batchId,
          recipientId: input.recipientWalletAddress,
        },
        include: {
          batch: {
            include: {
              creator: true,
            },
          },
        },
      })

      if (!payment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found',
        })
      }

      if (!payment.batch.isPrivate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment is not private',
        })
      }

      if (!payment.encryptedData || !payment.nonce) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Encrypted data not available',
        })
      }

      // Reconstruct keypair from private key
      // Note: In production, use proper base58 decoding
      const privateKeyBytes = Buffer.from(input.recipientPrivateKey, 'base64')
      const recipientKeypair = Keypair.fromSecretKey(privateKeyBytes)

      // Verify wallet address matches
      if (recipientKeypair.publicKey.toBase58() !== input.recipientWalletAddress) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Private key does not match wallet address',
        })
      }

      // Get sender public key from batch creator
      const senderPublicKey = new PublicKey(
        payment.batch.creator.walletAddress
      )

      // Decrypt payment
      const decrypted = await privacyManager.decryptPayment({
        encryptedData: payment.encryptedData,
        nonce: payment.nonce,
        senderPublicKey,
        recipientKeypair,
      })

      return {
        amount: decrypted.amount,
        memo: decrypted.memo,
        timestamp: decrypted.timestamp,
      }
    }),

  /**
   * Generate Merkle proof for a payment
   */
  generateProof: protectedProcedure
    .input(
      z.object({
        batchId: z.string().cuid(),
        paymentIndex: z.number().int().min(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.paymentBatch.findUnique({
        where: { id: input.batchId },
        include: {
          payments: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!batch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Batch not found',
        })
      }

      if (!batch.isPrivate || !batch.merkleRoot) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Batch is not private or Merkle root not available',
        })
      }

      if (input.paymentIndex >= batch.payments.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment index out of range',
        })
      }

      const payments = batch.payments.map((p) => ({
        commitment: p.commitment || '',
      }))

      const { proof, root } = privacyManager.generateProof(
        payments,
        input.paymentIndex
      )

      // Verify root matches
      if (root !== batch.merkleRoot) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Merkle root mismatch',
        })
      }

      return {
        proof,
        root,
        commitment: batch.payments[input.paymentIndex].commitment,
      }
    }),

  /**
   * Verify Merkle proof
   */
  verifyProof: protectedProcedure
    .input(
      z.object({
        commitment: z.string(),
        proof: z.array(z.string()),
        root: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isValid = privacyManager.verifyProof(
        input.commitment,
        input.proof,
        input.root
      )

      return { isValid }
    }),
})
