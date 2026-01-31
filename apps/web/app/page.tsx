'use client'

import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '../components/ui/button'
import Prism from '../components/Prism'
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Lock, 
  CheckCircle, 
  Eye, 
  Users, 
  FileCheck,
  Database,
  Key,
  Globe,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react'

export default function Home() {
  const { connected } = useWallet()

  return (
    <main className="flex min-h-screen flex-col relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Prism Background */}
        <div className="absolute inset-0 opacity-40">
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32 z-10 w-full">
          <div className="max-w-4xl mx-auto">
            {/* Text Content */}
            <div className="text-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-background-card/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary glass animate-fade-in">
                <Shield className="mr-2 h-4 w-4" />
                Privacy-First Payroll Platform
              </div>
              
              <h1 className="text-5xl font-display font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-fade-in-up">
                Private Payments for Web3 Organizations
              </h1>
              
              <p className="text-xl text-foreground-muted leading-relaxed max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
                ShadowStream enables secure, compliant batch payments on Solana while keeping payment amounts private. Built for organizations that value both transparency and confidentiality.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animate-delay-300">
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

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border-light max-w-2xl mx-auto animate-fade-in-up animate-delay-400">
                <div>
                  <div className="text-2xl font-display font-bold text-primary">50+</div>
                  <div className="text-sm text-foreground-muted mt-1">Payments per Batch</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-primary">100%</div>
                  <div className="text-sm text-foreground-muted mt-1">Private Amounts</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-primary">ZK</div>
                  <div className="text-sm text-foreground-muted mt-1">Zero-Knowledge Proofs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-elevated/30 to-background"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Enterprise-Grade Privacy Solutions
            </h2>
            <p className="mt-4 text-xl text-foreground-muted max-w-2xl mx-auto">
              Built for organizations that require both transparency and confidentiality in their financial operations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-100">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">Private Payments</h3>
                <p className="text-foreground-muted leading-relaxed">
                  Payment amounts are encrypted off-chain. Only commitment hashes are stored on-chain, keeping amounts private while maintaining verifiability through zero-knowledge proofs.
                </p>
              </div>
            </div>

            <div className="group relative rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-200">
              <div className="absolute top-0 right-0 h-32 w-32 bg-accent/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 border border-accent/30 text-accent">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">Batch Processing</h3>
                <p className="text-foreground-muted leading-relaxed">
                  Process up to 50 payments in a single Solana transaction. Optimized for compute units and gas efficiency, reducing costs significantly.
                </p>
              </div>
            </div>

            <div className="group relative rounded-2xl border border-border-light bg-background-card p-8 card-hover animate-fade-in-up animate-delay-300">
              <div className="absolute top-0 right-0 h-32 w-32 bg-secondary/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 border border-secondary/30 text-secondary">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">Multi-Sig Approval</h3>
                <p className="text-foreground-muted leading-relaxed">
                  Role-based access control with approval workflows. Finance creates, admins approve, owners execute. Complete audit trail for compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-light bg-background-card p-8 glass animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/20 border border-error/30 text-error">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">The Problem</h3>
              </div>
              <ul className="space-y-4 text-foreground-muted">
                <li className="flex items-start gap-3">
                  <span className="text-error text-xl mt-0.5">✗</span>
                  <span>Public blockchain exposes all payment amounts to competitors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-error text-xl mt-0.5">✗</span>
                  <span>Payroll structure visible to anyone monitoring the chain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-error text-xl mt-0.5">✗</span>
                  <span>No privacy for sensitive financial data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-error text-xl mt-0.5">✗</span>
                  <span>Difficult to maintain compliance while preserving privacy</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-background-card p-8 glass animate-fade-in-up animate-delay-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">Our Solution</h3>
              </div>
              <ul className="space-y-4 text-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-success mt-0.5" />
                  <span>Encrypted payment amounts stored off-chain securely</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-success mt-0.5" />
                  <span>Only commitment hashes visible on-chain for verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-success mt-0.5" />
                  <span>Recipients can decrypt their individual amounts privately</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-success mt-0.5" />
                  <span>Selective disclosure for compliance and audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border-light bg-background-card p-6 text-center card-hover animate-fade-in-up animate-delay-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary mx-auto mb-4">
                <Eye className="h-6 w-6" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">Zero-Knowledge Proofs</h4>
              <p className="text-sm text-foreground-muted">Verify transactions without revealing amounts</p>
            </div>
            
            <div className="rounded-xl border border-border-light bg-background-card p-6 text-center card-hover animate-fade-in-up animate-delay-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">Role-Based Access</h4>
              <p className="text-sm text-foreground-muted">Granular permissions and workflows</p>
            </div>
            
            <div className="rounded-xl border border-border-light bg-background-card p-6 text-center card-hover animate-fade-in-up animate-delay-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 border border-secondary/30 text-secondary mx-auto mb-4">
                <FileCheck className="h-6 w-6" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">Audit Ready</h4>
              <p className="text-sm text-foreground-muted">Full compliance and audit trail support</p>
            </div>
            
            <div className="rounded-xl border border-border-light bg-background-card p-6 text-center card-hover animate-fade-in-up animate-delay-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20 border border-success/30 text-success mx-auto mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">Solana Speed</h4>
              <p className="text-sm text-foreground-muted">Lightning-fast transactions and efficiency</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background-elevated/30 to-transparent"></div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-2xl border border-border-light bg-background-card p-12 glass animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary mx-auto mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="mt-4 text-xl text-foreground-muted mb-8">
              Connect your wallet and start making private payments today
            </p>
            <div className="flex justify-center">
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
        </div>
      </section>
    </main>
  )
}
