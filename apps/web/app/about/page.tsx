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
  Globe,
  TrendingUp,
  Building2
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 border-b border-border-light">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-background-card/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary glass mb-6">
              <Shield className="mr-2 h-4 w-4" />
              Privacy-First Platform
            </div>
            <h1 className="text-5xl font-display font-bold text-foreground sm:text-6xl lg:text-7xl mb-6">
              What We're Solving
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-foreground-muted">
              ShadowStream addresses the critical privacy gap in Web3 payroll systems
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center rounded-full border border-error/30 bg-error/20 px-4 py-2 text-sm font-medium text-error mb-4">
              The Problem
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Public Blockchains Expose Everything
            </h2>
            <p className="text-xl text-foreground-muted">
              Traditional blockchain payments reveal sensitive financial information
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-error/30 bg-background-card p-6 card-hover animate-fade-in-up animate-delay-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/20 border border-error/30 text-error mb-4">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Public Visibility
              </h3>
              <p className="text-foreground-muted text-sm">
                Every payment amount is visible to anyone on Solana Explorer
              </p>
            </div>

            <div className="rounded-xl border border-error/30 bg-background-card p-6 card-hover animate-fade-in-up animate-delay-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/20 border border-error/30 text-error mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Competitive Disadvantage
              </h3>
              <p className="text-foreground-muted text-sm">
                Competitors can analyze your payroll structure and compensation
              </p>
            </div>

            <div className="rounded-xl border border-error/30 bg-background-card p-6 card-hover animate-fade-in-up animate-delay-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/20 border border-error/30 text-error mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Privacy Violations
              </h3>
              <p className="text-foreground-muted text-sm">
                Employee compensation data exposed without consent
              </p>
            </div>

            <div className="rounded-xl border border-error/30 bg-background-card p-6 card-hover animate-fade-in-up animate-delay-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/20 border border-error/30 text-error mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Compliance Challenges
              </h3>
              <p className="text-foreground-muted text-sm">
                Difficult to balance transparency with privacy requirements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center rounded-full border border-success/30 bg-success/20 px-4 py-2 text-sm font-medium text-success mb-4">
              Our Solution
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Privacy-Preserving Payroll Platform
            </h2>
            <p className="mt-4 text-xl text-foreground-muted">
              Encrypt amounts off-chain, verify commitments on-chain
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-12">
            <div className="rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-100">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
                <Key className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Off-Chain Encryption
              </h3>
              <p className="text-foreground-muted">
                Payment amounts are encrypted using NaCl Box encryption before being stored in our secure database. Only recipients can decrypt their individual payments.
              </p>
            </div>

            <div className="rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-200">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 border border-accent/30 text-accent">
                <Database className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                On-Chain Commitments
              </h3>
              <p className="text-foreground-muted">
                Only SHA256 commitment hashes are stored on-chain in memo fields. These allow verification without revealing actual amounts.
              </p>
            </div>

            <div className="rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-300">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-success/20 border border-success/30 text-success">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Selective Disclosure
              </h3>
              <p className="text-foreground-muted">
                Organizations can generate audit proofs and selectively disclose payment information for compliance while maintaining privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              How ShadowStream Works
            </h2>
            <p className="mt-4 text-xl text-foreground-muted">
              A simple, secure process for private payments
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-100">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-display font-bold text-background">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Create Payment Batch
                </h3>
                <p className="text-foreground-muted">
                  Organization creates a batch with up to 50 recipients. Choose to make it private (encrypted) or public.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-200">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-display font-bold text-background">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Encrypt & Store
                </h3>
                <p className="text-foreground-muted">
                  For private payments, amounts are encrypted off-chain using NaCl Box. Commitment hashes are stored on-chain in memo fields.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-300">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-display font-bold text-background">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Approve & Execute
                </h3>
                <p className="text-foreground-muted">
                  Admins approve the batch, then it's executed on Solana. Payments are sent, but amounts remain hidden on-chain.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-400">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-2xl font-display font-bold text-background">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Recipients Decrypt
                </h3>
                <p className="text-foreground-muted">
                  Recipients use their private keys to decrypt their payment amounts. Only they can see their individual payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Guarantees */}
      <section className="py-20 relative border-t border-border-light">
        <div className="absolute inset-0 bg-background-elevated/30"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary mx-auto mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Privacy Guarantees
            </h2>
            <p className="text-xl text-foreground-muted">
              What's hidden, what's visible, and what's possible
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border-light bg-background-card p-6 glass animate-fade-in-up animate-delay-100">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-6 w-6 text-success mr-2" />
                <h3 className="text-lg font-display font-semibold text-foreground">What's Hidden</h3>
              </div>
              <ul className="space-y-2 text-foreground-muted">
                <li>• Payment amounts (encrypted off-chain)</li>
                <li>• Individual memos (encrypted with payment)</li>
                <li>• Batch totals (can be hidden)</li>
                <li>• Payment relationships (can use stealth addresses)</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border-light bg-background-card p-6 glass animate-fade-in-up animate-delay-200">
              <div className="flex items-center mb-3">
                <Eye className="h-6 w-6 text-warning mr-2" />
                <h3 className="text-lg font-display font-semibold text-foreground">What's Visible</h3>
              </div>
              <ul className="space-y-2 text-foreground-muted">
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
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Who Benefits from ShadowStream?
            </h2>
            <p className="text-xl text-foreground-muted">
              Built for organizations that value privacy and compliance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Web3 Organizations
              </h3>
              <p className="text-foreground-muted">
                DAOs, protocols, and Web3 companies that need to pay contractors, employees, and contributors privately.
              </p>
            </div>

            <div className="rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Finance Teams
              </h3>
              <p className="text-foreground-muted">
                Finance managers who need to process payroll while maintaining confidentiality and compliance.
              </p>
            </div>

            <div className="rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20 border border-success/30 text-success mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Compliance Officers
              </h3>
              <p className="text-foreground-muted">
                Organizations that need audit trails and selective disclosure capabilities for regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative border-t border-border-light">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-2xl border border-border-light bg-background-card p-12 glass animate-fade-in-up">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Ready to Make Private Payments?
            </h2>
            <p className="text-xl text-foreground-muted mb-8">
              Join organizations using ShadowStream for secure, private payroll
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="outline">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
