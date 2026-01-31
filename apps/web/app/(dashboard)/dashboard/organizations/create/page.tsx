'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { Keypair } from '@solana/web3.js'
import { trpc } from '../../../../../lib/trpc'
import { Button } from '../../../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/card'
import { ArrowLeft, ArrowRight, Building2, Key, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateOrganizationPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [name, setName] = useState('')
  const [vaultAddress, setVaultAddress] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const createOrganization = trpc.organization.create.useMutation({
    onSuccess: (data) => {
      toast.success('Organization created successfully!')
      router.push(`/dashboard/organizations/${data.organization.id}`)
    },
    onError: (error) => {
      console.error('Create organization error:', error)
      toast.error(error.message || 'Failed to create organization')
    },
  })

  const generateVaultAddress = () => {
    setIsGenerating(true)
    try {
      const keypair = Keypair.generate()
      setVaultAddress(keypair.publicKey.toBase58())
      toast.success('Vault address generated')
    } catch (error) {
      toast.error('Failed to generate vault address')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter an organization name')
      return
    }

    if (name.length > 100) {
      toast.error('Organization name must be 100 characters or less')
      return
    }

    if (vaultAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(vaultAddress)) {
      toast.error('Invalid Solana address format')
      return
    }

    createOrganization.mutate({
      name: name.trim(),
      vaultAddress: vaultAddress.trim() || undefined,
    })
  }

  if (!connected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary mx-auto mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Connect Your Wallet</h1>
          <p className="text-foreground-muted mb-6">Please connect your wallet to create an organization</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-fade-in-up">
        <Link href="/dashboard" className="inline-flex items-center text-foreground-muted hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Create Organization</h1>
        <p className="text-lg text-foreground-muted">
          Create a new organization to start making private payments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle>Organization Name</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="e.g., Acme Corp"
              required
              maxLength={100}
            />
            <p className="mt-2 text-sm text-foreground-muted">
              {name.length}/100 characters
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Vault Address</CardTitle>
                  <p className="text-sm text-foreground-muted mt-1">
                    Optional - Solana address for the organization vault
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateVaultAddress}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={vaultAddress}
              onChange={(e) => setVaultAddress(e.target.value)}
              className="block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors font-mono text-sm"
              placeholder="Enter Solana address or leave empty to auto-generate"
              pattern="^[1-9A-HJ-NP-Za-km-z]{32,44}$"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4 border-t border-border-light">
          <Link href="/dashboard" className="flex-1">
            <Button type="button" variant="outline" size="lg" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            className="flex-1 group"
            disabled={createOrganization.isLoading}
          >
            {createOrganization.isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                Create Organization
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
