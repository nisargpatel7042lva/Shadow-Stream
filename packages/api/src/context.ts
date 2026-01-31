import { db, getOrCreateUser } from '@shadowstream/database'
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

export async function createContext(opts?: { req?: Request }): Promise<Context> {
  const context: Context = {
    db,
    privacyService: new PrivacyManager(),
    solanaConnection: process.env.SOLANA_RPC_URL
      ? new Connection(process.env.SOLANA_RPC_URL, 'confirmed')
      : undefined,
  }

  // Extract wallet address from headers for wallet-based authentication
  if (opts?.req) {
    const walletAddress = opts.req.headers.get('x-wallet-address')
    
    if (walletAddress) {
      // Validate wallet address format
      const walletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
      if (walletRegex.test(walletAddress)) {
        try {
          // Get or create user from wallet address
          const user = await getOrCreateUser(walletAddress)
          
          context.session = {
            user: {
              id: user.id,
              walletAddress: user.walletAddress,
              email: user.email || undefined,
            },
          }
        } catch (error) {
          // If user creation fails, continue without session
          console.error('Failed to get/create user:', error)
        }
      } else {
        console.warn('Invalid wallet address format:', walletAddress)
      }
    } else {
      console.warn('No x-wallet-address header found in request')
    }
  }

  return context
}
