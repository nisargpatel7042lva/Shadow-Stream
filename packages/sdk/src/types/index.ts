import { PublicKey } from '@solana/web3.js'

export interface Recipient {
  publicKey: PublicKey
  amount: number
  memo?: string
}

export interface PaymentBatch {
  batchId: number
  recipients: Recipient[]
  tokenMint?: PublicKey
  totalAmount: number
}

export interface EncryptedBatch {
  payments: Array<{
    recipientPublicKey: string
    encryptedData: string
    nonce: string
    commitment: string
  }>
  merkleRoot: string
}

export interface DecryptedPayment {
  amount: number
  memo: string
  timestamp: number
}
