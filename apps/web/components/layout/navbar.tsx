'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const { connected } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationLinks = connected
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/payments/create', label: 'Create Payment' },
        { href: '/invoices', label: 'Invoices' },
        { href: '/settings', label: 'Settings' },
        { href: '/about', label: 'About' },
      ]
    : [{ href: '/about', label: 'About' }]

  return (
    <nav className="sticky top-0 z-50 border-b border-border glass-strong">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {connected && (
              <>
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
              </>
            )}
            <Link
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-muted transition-all duration-200 hover:text-foreground hover:bg-background-elevated"
            >
              About
            </Link>
          </div>

          {/* Desktop Wallet Button */}
          <div className="hidden md:block">
            <WalletMultiButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <WalletMultiButton />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted hover:bg-background-elevated hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="md:hidden border-t border-border-light bg-background-card animate-fade-in relative z-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-foreground-muted hover:bg-background-elevated hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
