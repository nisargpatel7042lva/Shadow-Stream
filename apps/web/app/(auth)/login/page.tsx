'use client'

import Image from 'next/image'
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border-light bg-background-card p-8 glass animate-fade-in-up">
        <div className="text-center">
          <div className="relative h-20 w-20 mx-auto mb-6">
            <Image
              src="/logo.png"
              alt="ShadowStream"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome to ShadowStream</h1>
          <p className="mt-2 text-foreground-muted">
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
