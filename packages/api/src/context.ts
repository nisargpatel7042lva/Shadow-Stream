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
    
    console.log('[Context] Received request headers:', {
      'x-wallet-address': walletAddress,
      'all-headers': Object.fromEntries(opts.req.headers.entries())
    })
    
    if (walletAddress) {
      // Validate wallet address format
      const walletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
      if (walletRegex.test(walletAddress)) {
        try {
          console.log('[Context] Valid wallet address, getting/creating user:', walletAddress)
          // Get or create user from wallet address
          const user = await getOrCreateUser(walletAddress)
          console.log('[Context] ✅ User found/created:', { id: user.id, walletAddress: user.walletAddress })
          
          context.session = {
            user: {
              id: user.id,
              walletAddress: user.walletAddress,
              email: user.email || undefined,
            },
          }
          console.log('[Context] ✅ Session created successfully')
        } catch (error) {
          // If user creation fails, continue without session
          console.error('[Context] ❌ Failed to get/create user:', error)
          console.error('[Context] ❌ Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          })
        }
      } else {
        console.warn('[Context] ❌ Invalid wallet address format:', walletAddress)
      }
    } else {
      console.warn('[Context] ❌ No x-wallet-address header found in request')
    }
  } else {
    console.warn('[Context] ❌ No request object provided')
  }
  
  console.log('[Context] Final context:', {
    hasSession: !!context.session,
    userId: context.session?.user.id,
    walletAddress: context.session?.user.walletAddress
  })

  return context
}
