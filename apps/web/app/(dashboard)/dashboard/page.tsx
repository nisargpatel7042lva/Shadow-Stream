'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { trpc } from '../../../lib/trpc'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/ui/loading'
import Link from 'next/link'
import { Building2, Plus, ArrowRight, Shield, Zap, Users } from 'lucide-react'

export default function DashboardPage() {
  const { publicKey, connected } = useWallet()
  const { data: organizations, isLoading } = trpc.organization.list.useQuery(
    undefined,
    { enabled: !!publicKey }
  )

  if (!connected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ShadowStream</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to continue</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your organizations and payment batches
          </p>
        </div>
        <Link href="/payments/create">
          <Button size="lg" className="group">
            <Plus className="mr-2 h-5 w-5" />
            Create Payment Batch
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {organizations && organizations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-50 blur-3xl"></div>
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {org.role}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{org.name}</h3>
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Zap className="mr-1 h-4 w-4" />
                    {org._count?.batches || 0} batches
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {org._count?.members || 0} members
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/organizations/${org.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/payments/create?org=${org.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Create Batch
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No organizations yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first organization to start making private payments
          </p>
          <Link href="/dashboard/organizations/create">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Organization
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
