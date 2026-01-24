'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { connected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      router.push('/dashboard')
    }
  }, [connected, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to ShadowStream</h1>
          <p className="mt-2 text-gray-600">
            Connect your Solana wallet to continue
          </p>
        </div>
        <div className="flex justify-center">
          <WalletMultiButton />
        </div>
      </div>
    </div>
  )
}
