import { db } from '@shadowstream/database'
import { PrivacyManager } from '@shadowstream/sdk'
import { Connection } from '@solana/web3.js'

export interface Context {
  db: typeof db
  session?: {
    user: {
      id: string
      walletAddress: string
      email?: string
    }
  }
  privacyService: PrivacyManager
  solanaConnection?: Connection
}

export function createContext(): Context {
  return {
    db,
    privacyService: new PrivacyManager(),
    solanaConnection: process.env.SOLANA_RPC_URL
      ? new Connection(process.env.SOLANA_RPC_URL, 'confirmed')
      : undefined,
  }
}
