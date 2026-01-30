import { TRPCError } from '@trpc/server'
import { db, getUserByWallet } from '@shadowstream/database'

/**
 * Get user from wallet address (for wallet-based auth)
 */
export async function getUserFromWallet(walletAddress: string) {
  const user = await getUserByWallet(walletAddress)

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    })
  }

  return user
}

/**
 * Verify wallet signature
 * 
 * Note: For demo purposes, this returns true to allow development without
 * full signature verification. In production, this should verify the signature
 * against the wallet address and message using Solana's native signature verification.
 * 
 * Production implementation would use:
 * - nacl.sign.detached.verify() or
 * - PublicKey.verify() from @solana/web3.js
 */
export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  // Demo mode: Allow all signatures for hackathon demo
  // Production: Implement actual signature verification here
  return true
}
