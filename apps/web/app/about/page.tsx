'use client'

import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  Zap, 
  Users, 
  FileText,
  ArrowRight,
  Key,
  Database,
  Globe
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl">
              What We're Solving
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-indigo-100">
              ShadowStream addresses the critical privacy gap in Web3 payroll systems
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800 mb-4">
              The Problem
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Public Blockchains Expose Everything
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
              <Eye className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Public Visibility
              </h3>
              <p className="text-gray-600 text-sm">
                Every payment amount is visible to anyone on Solana Explorer
              </p>
            </div>

            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
              <Users className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Competitive Disadvantage
              </h3>
              <p className="text-gray-600 text-sm">
                Competitors can analyze your payroll structure and compensation
              </p>
            </div>

            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
              <Lock className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Privacy Violations
              </h3>
              <p className="text-gray-600 text-sm">
                Employee compensation data exposed without consent
              </p>
            </div>

            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
              <FileText className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compliance Challenges
              </h3>
              <p className="text-gray-600 text-sm">
                Difficult to balance transparency with privacy requirements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 mb-4">
              Our Solution
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Privacy-Preserving Payroll Platform
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Encrypt amounts off-chain, verify commitments on-chain
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-12">
            <div className="rounded-2xl bg-white p-8 shadow-soft border border-gray-200">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Key className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Off-Chain Encryption
              </h3>
              <p className="text-gray-600">
                Payment amounts are encrypted using NaCl Box encryption before being stored in our secure database. Only recipients can decrypt their individual payments.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-soft border border-gray-200">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <Database className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                On-Chain Commitments
              </h3>
              <p className="text-gray-600">
                Only SHA256 commitment hashes are stored on-chain in memo fields. These allow verification without revealing actual amounts.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-soft border border-gray-200">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Selective Disclosure
              </h3>
              <p className="text-gray-600">
                Organizations can generate audit proofs and selectively disclose payment information for compliance while maintaining privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              How ShadowStream Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              A simple, secure process for private payments
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-8">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Payment Batch
                </h3>
                <p className="text-gray-600">
                  Organization creates a batch with up to 50 recipients. Choose to make it private (encrypted) or public.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-8">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Encrypt & Store
                </h3>
                <p className="text-gray-600">
                  For private payments, amounts are encrypted off-chain using NaCl Box. Commitment hashes are stored on-chain in memo fields.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 p-8">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-600 text-2xl font-bold text-white">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Approve & Execute
                </h3>
                <p className="text-gray-600">
                  Admins approve the batch, then it's executed on Solana. Payments are sent, but amounts remain hidden on-chain.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-8">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Recipients Decrypt
                </h3>
                <p className="text-gray-600">
                  Recipients use their private keys to decrypt their payment amounts. Only they can see their individual payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Guarantees */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
            <h2 className="text-4xl font-bold mb-4">
              Privacy Guarantees
            </h2>
            <p className="text-xl text-gray-300">
              What's hidden, what's visible, and what's possible
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold">What's Hidden</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>• Payment amounts (encrypted off-chain)</li>
                <li>• Individual memos (encrypted with payment)</li>
                <li>• Batch totals (can be hidden)</li>
                <li>• Payment relationships (can use stealth addresses)</li>
              </ul>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6">
              <div className="flex items-center mb-3">
                <Eye className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold">What's Visible</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>• Transaction existence (batch creation/execution)</li>
                <li>• Recipient addresses (public keys)</li>
                <li>• Commitment hashes (in memo fields)</li>
                <li>• Batch metadata (title, description, timestamps)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Who Benefits from ShadowStream?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft">
              <Globe className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Web3 Organizations
              </h3>
              <p className="text-gray-600">
                DAOs, protocols, and Web3 companies that need to pay contractors, employees, and contributors privately.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft">
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Finance Teams
              </h3>
              <p className="text-gray-600">
                Finance managers who need to process payroll while maintaining confidentiality and compliance.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft">
              <Shield className="h-10 w-10 text-cyan-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Compliance Officers
              </h3>
              <p className="text-gray-600">
                Organizations that need audit trails and selective disclosure capabilities for regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Make Private Payments?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join organizations using ShadowStream for secure, private payroll
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-white text-indigo-600 hover:bg-gray-100">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="bg-indigo-700 text-white hover:bg-indigo-800">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
