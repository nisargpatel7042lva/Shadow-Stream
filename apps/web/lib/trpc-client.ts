import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@shadowstream/api'

export const trpc = createTRPCReact<AppRouter>()

// Global wallet address store (set by wallet provider)
let currentWalletAddress: string | null = null

export function setWalletAddress(address: string | null) {
  currentWalletAddress = address
}

export function getWalletAddress(): string | null {
  return currentWalletAddress
}

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        fetch: async (url, options) => {
          const walletAddress = getWalletAddress()
          
          // Start with existing headers from options
          const headers = new Headers(options?.headers)
          
          // Always add wallet address header if available
          if (walletAddress) {
            headers.set('x-wallet-address', walletAddress)
            console.log('[tRPC] ✅ Adding wallet address header:', walletAddress, 'to URL:', url)
          } else {
            console.error('[tRPC] ❌ No wallet address available! Current value:', walletAddress)
            console.error('[tRPC] ❌ This will cause authentication to fail!')
          }
          
          // Log all headers being sent (for debugging)
          console.log('[tRPC] Request headers:', Object.fromEntries(headers.entries()))
          
          // Call fetch with updated headers
          const response = await fetch(url, {
            ...options,
            headers,
          })
          
          // Log response status
          console.log('[tRPC] Response status:', response.status, 'for URL:', url)
          
          return response
        },
      }),
    ],
  })
}

export const trpcClient = createTrpcClient()
