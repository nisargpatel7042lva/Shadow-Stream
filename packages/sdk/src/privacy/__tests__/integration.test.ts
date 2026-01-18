/**
 * Integration tests for privacy layer
 * 
 * These tests verify the complete privacy flow:
 * 1. Encrypt batch
 * 2. Store commitments on-chain
 * 3. Decrypt individual payments
 * 4. Verify Merkle proofs
 */

import { Keypair, PublicKey } from '@solana/web3.js'
import { PrivacyManager } from '../privacy-manager'
import { BulkPaymentExecutor } from '../../solana/bulk-payment'

describe('Privacy Integration', () => {
  let privacyManager: PrivacyManager
  let sender: Keypair
  let recipients: Keypair[]

  beforeEach(() => {
    privacyManager = new PrivacyManager()
    sender = Keypair.generate()
    recipients = [
      Keypair.generate(),
      Keypair.generate(),
      Keypair.generate(),
    ]
  })

  describe('Complete Privacy Flow', () => {
    it('should encrypt batch and allow individual decryption', async () => {
      // 1. Create payment batch
      const paymentData = recipients.map((r, i) => ({
        publicKey: r.publicKey,
        amount: (i + 1) * 1000000,
        memo: `Payment ${i + 1}`,
      }))

      // 2. Encrypt batch
      const encrypted = await privacyManager.encryptBatch({
        recipients: paymentData,
        senderKeypair: sender,
      })

      expect(encrypted.payments).toHaveLength(3)
      expect(encrypted.merkleRoot).toBeTruthy()

      // 3. Verify each recipient can decrypt their payment
      for (let i = 0; i < recipients.length; i++) {
        const decrypted = await privacyManager.decryptPayment({
          encryptedData: encrypted.payments[i].encryptedData,
          nonce: encrypted.payments[i].nonce,
          senderPublicKey: sender.publicKey,
          recipientKeypair: recipients[i],
        })

        expect(decrypted.amount).toBe(paymentData[i].amount)
        expect(decrypted.memo).toBe(paymentData[i].memo)
      }

      // 4. Verify recipients cannot decrypt each other's payments
      try {
        await privacyManager.decryptPayment({
          encryptedData: encrypted.payments[0].encryptedData,
          nonce: encrypted.payments[0].nonce,
          senderPublicKey: sender.publicKey,
          recipientKeypair: recipients[1], // Wrong recipient
        })
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeTruthy()
      }
    })

    it('should generate and verify Merkle proofs', async () => {
      const paymentData = recipients.map((r, i) => ({
        publicKey: r.publicKey,
        amount: (i + 1) * 1000000,
      }))

      const encrypted = await privacyManager.encryptBatch({
        recipients: paymentData,
        senderKeypair: sender,
      })

      const payments = encrypted.payments.map((p) => ({
        commitment: p.commitment,
      }))

      // Generate proof for first payment
      const { proof, root } = privacyManager.generateProof(payments, 0)

      // Verify proof
      const isValid = privacyManager.verifyProof(
        encrypted.payments[0].commitment,
        proof,
        root
      )

      expect(isValid).toBe(true)
      expect(root).toBe(encrypted.merkleRoot)

      // Verify invalid proof is rejected
      const invalidProof = privacyManager.verifyProof(
        'invalid_commitment',
        proof,
        root
      )
      expect(invalidProof).toBe(false)
    })

    it('should maintain privacy guarantees', async () => {
      const paymentData = [
        {
          publicKey: recipients[0].publicKey,
          amount: 5000000, // Large amount
          memo: 'Confidential payment',
        },
        {
          publicKey: recipients[1].publicKey,
          amount: 1000000, // Smaller amount
          memo: 'Regular payment',
        },
      ]

      const encrypted = await privacyManager.encryptBatch({
        recipients: paymentData,
        senderKeypair: sender,
      })

      // Verify commitments don't reveal amounts
      const commitments = encrypted.payments.map((p) => p.commitment)
      
      // Commitments should be different (due to randomness)
      expect(commitments[0]).not.toBe(commitments[1])
      
      // Commitments should not contain amount information
      // (This is a basic check - in production, use formal verification)
      expect(commitments[0].length).toBe(64) // SHA256 hex length
      expect(commitments[1].length).toBe(64)

      // Verify encrypted data doesn't reveal amounts
      const encryptedData = encrypted.payments.map((p) => p.encryptedData)
      expect(encryptedData[0]).not.toContain('5000000')
      expect(encryptedData[1]).not.toContain('1000000')
    })
  })

  describe('Batch Privacy', () => {
    it('should handle large batches (50 recipients)', async () => {
      const largeRecipients = Array.from({ length: 50 }, () =>
        Keypair.generate()
      )

      const paymentData = largeRecipients.map((r, i) => ({
        publicKey: r.publicKey,
        amount: (i + 1) * 100000,
        memo: `Payment ${i + 1}`,
      }))

      const encrypted = await privacyManager.encryptBatch({
        recipients: paymentData,
        senderKeypair: sender,
      })

      expect(encrypted.payments).toHaveLength(50)
      expect(encrypted.merkleRoot).toBeTruthy()

      // Verify Merkle tree works for large batch
      const payments = encrypted.payments.map((p) => ({
        commitment: p.commitment,
      }))

      const { proof, root } = privacyManager.generateProof(payments, 25)
      const isValid = privacyManager.verifyProof(
        encrypted.payments[25].commitment,
        proof,
        root
      )

      expect(isValid).toBe(true)
    })
  })
})
