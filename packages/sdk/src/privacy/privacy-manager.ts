import { Keypair, PublicKey } from '@solana/web3.js'
import { CustomPrivacyService } from './custom-zk'
import type { EncryptedBatch, DecryptedPayment } from '../types'

/**
 * Privacy Manager - Unified interface for privacy operations
 * Supports multiple privacy protocols with fallback to custom solution
 */
export class PrivacyManager {
  private customPrivacy: CustomPrivacyService

  constructor() {
    this.customPrivacy = new CustomPrivacyService()
  }

  /**
   * Encrypt payment batch data
   */
  async encryptBatch(params: {
    recipients: Array<{
      publicKey: PublicKey
      amount: number
      memo?: string
    }>
    senderKeypair: Keypair
    protocol?: 'custom-zk' | 'light-protocol' | 'arcium'
  }): Promise<EncryptedBatch> {
    // For now, use custom privacy solution
    // In future, can switch based on protocol parameter
    return await this.customPrivacy.encryptPaymentData({
      recipients: params.recipients,
      senderKeypair: params.senderKeypair,
    })
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
    return await this.customPrivacy.decryptPayment(params)
  }

  /**
   * Generate Merkle proof for a payment
   */
  generateProof(
    payments: Array<{ commitment: string }>,
    paymentIndex: number
  ): { proof: string[]; root: string } {
    return this.customPrivacy.generateMerkleProof(payments, paymentIndex)
  }

  /**
   * Verify Merkle proof
   */
  verifyProof(commitment: string, proof: string[], root: string): boolean {
    return this.customPrivacy.verifyMerkleProof(commitment, proof, root)
  }
}
