'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { trpc, trpcClient } from '../lib/trpc'
import { WalletProviders } from '../lib/wallet'
import { ToastProvider } from './toast-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <WalletProviders>
          <ToastProvider />
          {children}
        </WalletProviders>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
