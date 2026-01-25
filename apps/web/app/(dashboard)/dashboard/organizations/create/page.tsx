'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { Keypair } from '@solana/web3.js'
import { trpc } from '../../../../../lib/trpc'
import { Button } from '../../../../../components/ui/button'
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateOrganizationPage() {
  const router = useRouter()
  const { connected } = useWallet()
  const [name, setName] = useState('')
  const [vaultAddress, setVaultAddress] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const createOrganization = trpc.organization.create.useMutation({
    onSuccess: (data) => {
      toast.success('Organization created successfully!')
      router.push(`/dashboard/organizations/${data.organization.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create organization')
    },
  })

  const generateVaultAddress = () => {
    setIsGenerating(true)
    try {
      // Generate a random Solana address
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
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to create an organization</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Organization</h1>
        <p className="text-lg text-gray-600">
          Create a new organization to start making private payments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="e.g., Acme Corp"
            required
            maxLength={100}
          />
          <p className="mt-2 text-sm text-gray-500">
            {name.length}/100 characters
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-900">
              Vault Address (Optional)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateVaultAddress}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Address'}
            </Button>
          </div>
          <p className="mb-3 text-sm text-gray-600">
            Solana address for the organization vault. If not provided, one will be generated automatically.
          </p>
          <input
            type="text"
            value={vaultAddress}
            onChange={(e) => setVaultAddress(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-sm"
            placeholder="Enter Solana address or leave empty to auto-generate"
            pattern="^[1-9A-HJ-NP-Za-km-z]{32,44}$"
          />
        </div>

        <div className="flex gap-4">
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
              'Creating...'
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
