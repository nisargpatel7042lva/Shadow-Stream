'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function Navbar() {
  const { connected } = useWallet()

  return (
    <nav className="sticky top-0 z-50 border-b border-border glass-strong">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative h-9 w-9 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="ShadowStream"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-display font-bold text-foreground hidden sm:block">
                ShadowStream
              </span>
            </Link>
            {connected && (
              <div className="ml-10 hidden md:flex space-x-2">
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted transition-all duration-200 hover:text-foreground hover:bg-background-elevated"
                >
                  Dashboard
                </Link>
                <Link
                  href="/payments/create"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted transition-all duration-200 hover:text-foreground hover:bg-background-elevated"
                >
                  Create Payment
                </Link>
                <Link
                  href="/invoices"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted transition-all duration-200 hover:text-foreground hover:bg-background-elevated"
                >
                  Invoices
                </Link>
                <Link
                  href="/settings"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted transition-all duration-200 hover:text-foreground hover:bg-background-elevated"
                >
                  Settings
                </Link>
              </div>
            )}
            <Link
              href="/about"
              className="ml-4 rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted transition-all duration-200 hover:text-foreground hover:bg-background-elevated"
            >
              About
            </Link>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  )
}
