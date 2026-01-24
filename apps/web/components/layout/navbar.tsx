'use client'

import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Shield } from 'lucide-react'

export function Navbar() {
  const { connected } = useWallet()

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ShadowStream
              </span>
            </Link>
            {connected && (
              <div className="ml-10 hidden md:flex space-x-1">
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/payments/create"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-indigo-600"
                >
                  Create Payment
                </Link>
                <Link
                  href="/invoices"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-indigo-600"
                >
                  Invoices
                </Link>
                <Link
                  href="/settings"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-indigo-600"
                >
                  Settings
                </Link>
              </div>
            )}
            <Link
              href="/about"
              className="ml-4 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-indigo-600"
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
