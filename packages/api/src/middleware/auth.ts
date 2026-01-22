import { TRPCError } from '@trpc/server'
import { db } from '@shadowstream/database'
import { getUserByWallet } from '@shadowstream/database/utils'

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
 * Verify wallet signature (placeholder - implement with actual signature verification)
 */
export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  // TODO: Implement actual signature verification
  // For now, return true for development
  return true
}
