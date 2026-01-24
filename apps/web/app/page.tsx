'use client'

import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '../components/ui/button'
import { ArrowRight, Shield, Zap, Lock, CheckCircle } from 'lucide-react'

export default function Home() {
  const { connected } = useWallet()

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <Shield className="mr-2 h-4 w-4" />
              Privacy-First Payroll Platform
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
              <span className="gradient-text">ShadowStream</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 sm:text-2xl">
              Private, secure, and compliant batch payments for Web3 organizations on Solana
            </p>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
              Hide payment amounts from public view while maintaining full auditability and compliance
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {connected ? (
                <Link href="/dashboard">
                  <Button size="lg" className="group">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <WalletMultiButton />
              )}
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Why ShadowStream?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Built for organizations that value privacy and compliance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-soft transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Private Payments</h3>
              <p className="mt-3 text-gray-600">
                Payment amounts are encrypted off-chain. Only commitment hashes are stored on-chain, keeping amounts private while maintaining verifiability.
              </p>
            </div>

            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-soft transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Batch Processing</h3>
              <p className="mt-3 text-gray-600">
                Process up to 50 payments in a single Solana transaction. Optimized for compute units and gas efficiency.
              </p>
            </div>

            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-soft transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Multi-Sig Approval</h3>
              <p className="mt-3 text-gray-600">
                Role-based access control with approval workflows. Finance creates, admins approve, owners execute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-3 mt-1 text-red-500">✗</span>
                  <span>Public blockchain exposes all payment amounts</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 mt-1 text-red-500">✗</span>
                  <span>Competitors can see your payroll structure</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 mt-1 text-red-500">✗</span>
                  <span>No privacy for sensitive financial data</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 mt-1 text-red-500">✗</span>
                  <span>Difficult to maintain compliance while preserving privacy</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white shadow-soft">
              <h3 className="text-2xl font-bold mb-4">Our Solution</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                  <span>Encrypted payment amounts stored off-chain</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                  <span>Only commitment hashes visible on-chain</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                  <span>Recipients can decrypt their individual amounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                  <span>Selective disclosure for compliance and audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Connect your wallet and start making private payments today
          </p>
          <div className="mt-8">
            {connected ? (
              <Link href="/dashboard">
                <Button size="lg" className="group">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
