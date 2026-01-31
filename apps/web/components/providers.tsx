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

  // Set wallet address synchronously before creating client
  const walletAddress = connected && publicKey ? publicKey.toBase58() : null
  
  // Sync wallet address immediately when wallet connects/disconnects
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

  // Recreate tRPC client when wallet address changes to ensure headers are updated
  // Set wallet address synchronously before creating client to avoid race conditions
  const trpcClient = useMemo(() => {
    // Set wallet address synchronously before creating client
    if (walletAddress) {
      setWalletAddress(walletAddress)
    } else {
      setWalletAddress(null)
    }
    console.log('[WalletSync] Creating tRPC client, wallet:', walletAddress || 'disconnected')
    return createTrpcClient()
  }, [walletAddress])

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
