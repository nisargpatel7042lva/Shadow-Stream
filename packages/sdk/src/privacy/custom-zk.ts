import { Keypair, PublicKey } from '@solana/web3.js'
import { createHash } from 'crypto'
import * as tweetnacl from 'tweetnacl'
import type { EncryptedBatch, DecryptedPayment } from '../types'

/**
 * Custom privacy implementation using:
 * 1. Off-chain encryption (NaCl box)
 * 2. On-chain commitment hashes
 * 3. Merkle tree for recipient proofs
 */
export class CustomPrivacyService {
  /**
   * Encrypt payment amounts for recipients
   * Each recipient gets encrypted data they can decrypt with their private key
   */
  async encryptPaymentData(params: {
    recipients: Array<{
      publicKey: PublicKey
      amount: number
      memo?: string
    }>
    senderKeypair: Keypair
  }): Promise<EncryptedBatch> {
    const encryptedPayments = params.recipients.map((recipient) => {
      // Generate shared secret using Diffie-Hellman
      const recipientPubKey = recipient.publicKey.toBytes()
      const sharedSecret = tweetnacl.box.before(
        recipientPubKey,
        params.senderKeypair.secretKey
      )

      // Encrypt amount + memo
      const plaintext = JSON.stringify({
        amount: recipient.amount,
        memo: recipient.memo || '',
        timestamp: Date.now(),
      })

      const nonce = tweetnacl.randomBytes(24)
      const encrypted = tweetnacl.box.after(
        Buffer.from(plaintext),
        nonce,
        sharedSecret
      )

      // Create commitment hash (for on-chain verification)
      const commitment = this.createCommitment(
        recipient.publicKey,
        recipient.amount
      )

      return {
        recipientPublicKey: recipient.publicKey.toBase58(),
        encryptedData: Buffer.from(encrypted).toString('base64'),
        nonce: Buffer.from(nonce).toString('base64'),
        commitment: commitment,
      }
    })

    return {
      payments: encryptedPayments,
      merkleRoot: this.buildMerkleTree(encryptedPayments),
    }
  }

  /**
   * Decrypt payment for recipient
   */
  async decryptPayment(params: {
    encryptedData: string
    nonce: string
    senderPublicKey: PublicKey
    recipientKeypair: Keypair
  }): Promise<DecryptedPayment> {
    const sharedSecret = tweetnacl.box.before(
      params.senderPublicKey.toBytes(),
      params.recipientKeypair.secretKey
    )

    const decrypted = tweetnacl.box.open.after(
      Buffer.from(params.encryptedData, 'base64'),
      Buffer.from(params.nonce, 'base64'),
      sharedSecret
    )

    if (!decrypted) {
      throw new Error('Failed to decrypt payment data')
    }

    const data = JSON.parse(Buffer.from(decrypted).toString())

    return {
      amount: data.amount,
      memo: data.memo,
      timestamp: data.timestamp,
    }
  }

  /**
   * Create commitment hash (hidden on-chain)
   */
  private createCommitment(publicKey: PublicKey, amount: number): string {
    const data = Buffer.concat([
      publicKey.toBuffer(),
      Buffer.from(amount.toString()),
      Buffer.from(Math.random().toString()), // Add randomness
    ])

    return createHash('sha256').update(data).digest('hex')
  }

  /**
   * Build Merkle tree for batch verification
   */
  private buildMerkleTree(payments: any[]): string {
    // Implement Merkle tree construction
    // For MVP, return root hash
    const leaves = payments.map((p) => p.commitment)
    return this.hashLeaves(leaves)
  }

  private hashLeaves(leaves: string[]): string {
    if (leaves.length === 1) return leaves[0]

    const newLeaves: string[] = []
    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i]
      const right = leaves[i + 1] || left
      const combined = createHash('sha256')
        .update(left + right)
        .digest('hex')
      newLeaves.push(combined)
    }

    return this.hashLeaves(newLeaves)
  }
}
