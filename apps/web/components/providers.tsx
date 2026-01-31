'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { trpc, createTrpcClient, setWalletAddress } from '../lib/trpc'
import { WalletProviders } from '../lib/wallet'
import { ToastProvider } from './toast-provider'

function WalletSyncProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet()
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  // Create tRPC client that reads wallet address dynamically
  const trpcClient = useMemo(() => createTrpcClient(), [])

  // Sync wallet address to tRPC client immediately when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58()
      setWalletAddress(address)
      console.log('[WalletSync] Wallet address set:', address)
    } else {
      setWalletAddress(null)
      console.log('[WalletSync] Wallet disconnected')
    }
  }, [publicKey, connected])

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviders>
      <WalletSyncProvider>
        <ToastProvider />
        {children}
      </WalletSyncProvider>
    </WalletProviders>
  )
}
