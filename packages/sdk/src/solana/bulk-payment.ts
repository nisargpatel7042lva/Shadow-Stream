import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import type { Recipient } from '../types'
import type { CustomPrivacyService } from '../privacy/custom-zk'

export class BulkPaymentExecutor {
  constructor(
    private connection: Connection,
    private program: Program,
    private privacyService?: CustomPrivacyService
  ) {}

  /**
   * Execute a batch payment with optional privacy
   */
  async executeBatch(params: {
    vaultAddress: PublicKey
    batchId: number
    recipients: Recipient[]
    isPrivate: boolean
    authority: Keypair
  }): Promise<string> {
    const { vaultAddress, batchId, recipients, isPrivate, authority } = params

    // If private, encrypt payment data first
    let encryptedData = null
    if (isPrivate && this.privacyService) {
      encryptedData = await this.privacyService.encryptPaymentData({
        recipients: recipients.map(r => ({
          publicKey: r.publicKey,
          amount: r.amount,
          memo: r.memo,
        })),
        senderKeypair: authority,
      })
    }

    // Prepare recipients for on-chain batch
    // For private payments, store commitment hash in memo instead of actual amount
    const onChainRecipients = recipients.map((recipient, idx) => {
      let memo = Buffer.alloc(32)
      
      if (isPrivate && encryptedData) {
        // Store commitment hash in memo (first 32 bytes)
        const commitment = Buffer.from(
          encryptedData.payments[idx].commitment,
          'hex'
        ).slice(0, 32)
        memo = commitment
      } else if (recipient.memo) {
        // Store actual memo for non-private payments
        const memoBytes = Buffer.from(recipient.memo, 'utf-8')
        memoBytes.copy(memo, 0, 0, Math.min(32, memoBytes.length))
      }

      return {
        address: recipient.publicKey,
        amount: new BN(recipient.amount),
        memo: Array.from(memo),
      }
    })

    // Derive batch PDA
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('batch'),
        vaultAddress.toBuffer(),
        Buffer.from(batchId.toString().padStart(16, '0'), 'hex'),
      ],
      this.program.programId
    )

    // Build transaction
    const tx = await this.program.methods
      .createBatch(
        onChainRecipients,
        null, // token_mint (null for SOL)
        new BN(batchId)
      )
      .accounts({
        batch: batchPda,
        vault: vaultAddress,
        creator: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc()

    return tx
  }

  /**
   * Execute an already-created batch
   */
  async executeCreatedBatch(params: {
    batchPda: PublicKey
    vaultAddress: PublicKey
    recipients: PublicKey[] // For SOL transfers, these are recipient accounts
    authority: Keypair
  }): Promise<string> {
    const { batchPda, vaultAddress, recipients, authority } = params

    // Prepare remaining accounts for recipient transfers
    const remainingAccounts = recipients.map(recipient => ({
      pubkey: recipient,
      isSigner: false,
      isWritable: true,
    }))

    const tx = await this.program.methods
      .executeBatch()
      .accounts({
        batch: batchPda,
        vault: vaultAddress,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .signers([authority])
      .rpc()

    return tx
  }

  /**
   * Get vault balance
   */
  async getVaultBalance(vaultAddress: PublicKey): Promise<number> {
    return await this.connection.getBalance(vaultAddress)
  }
}
