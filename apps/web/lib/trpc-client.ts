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
        headers: () => {
          const walletAddress = getWalletAddress()
          const headers: Record<string, string> = {}
          
          if (walletAddress) {
            headers['x-wallet-address'] = walletAddress
          }
          
          return headers
        },
      }),
    ],
  })
}

export const trpcClient = createTrpcClient()
