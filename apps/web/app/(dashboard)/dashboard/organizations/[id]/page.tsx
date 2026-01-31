'use client'

import { useParams } from 'next/navigation'
import { trpc } from '../../../../../lib/trpc'
import { Button } from '../../../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/card'
import { LoadingSpinner } from '../../../../../components/ui/loading'
import { Building2, FileText, DollarSign, Users, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function OrganizationPage() {
  const params = useParams()
  const orgId = params.id as string

  const { data: org, isLoading } = trpc.organization.getById.useQuery({
    organizationId: orgId,
  })

  const { data: stats } = trpc.organization.getStats.useQuery(
    { organizationId: orgId },
    { enabled: !!org }
  )

  const { data: batches } = trpc.payment.listBatches.useQuery(
    { organizationId: orgId, limit: 10 },
    { enabled: !!org }
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-foreground-muted mb-4" />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Organization not found</h2>
        <p className="text-foreground-muted">The organization you're looking for doesn't exist</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">{org.name}</h1>
            <p className="mt-2 text-sm text-foreground-muted font-mono">
              Vault: {org.vaultAddress.slice(0, 8)}...{org.vaultAddress.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="animate-fade-in-up animate-delay-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-foreground-muted">Total Batches</div>
            </div>
            <div className="mt-1 text-3xl font-display font-bold text-foreground">{stats?.batches || 0}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up animate-delay-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-foreground-muted">Total Payments</div>
            </div>
            <div className="mt-1 text-3xl font-display font-bold text-foreground">{stats?.payments || 0}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up animate-delay-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20 border border-success/30 text-success">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-foreground-muted">Total Paid</div>
            </div>
            <div className="mt-1 text-3xl font-display font-bold text-foreground">
              {stats?.totalPaid ? Number(stats.totalPaid).toFixed(2) : '0'} SOL
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up animate-delay-400">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 border border-secondary/30 text-secondary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-foreground-muted">Invoices</div>
            </div>
            <div className="mt-1 text-3xl font-display font-bold text-foreground">{stats?.invoices || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between animate-fade-in-up animate-delay-500">
        <h2 className="text-2xl font-display font-bold text-foreground">Recent Batches</h2>
        <Link href={`/payments/create?org=${orgId}`}>
          <Button className="group">
            <Plus className="mr-2 h-5 w-5" />
            Create Batch
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <Card className="animate-fade-in-up animate-delay-600">
        <CardHeader>
          <CardTitle>Payment Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {batches?.batches.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-background-elevated transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        {batch.title}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        #{batch.batchNumber}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                      {Number(batch.totalAmount).toFixed(4)} SOL
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground-muted">
                      {batch.recipientCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
                          batch.status === 'COMPLETED'
                            ? 'bg-success/20 text-success border-success/30'
                            : batch.status === 'PENDING'
                            ? 'bg-warning/20 text-warning border-warning/30'
                            : 'bg-background-elevated text-foreground-muted border-border-light'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/payments/${batch.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {batches?.batches.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-foreground-muted mb-4" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No batches yet</h3>
              <p className="text-foreground-muted mb-6">Create your first payment batch to get started</p>
              <Link href={`/payments/create?org=${orgId}`}>
                <Button>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Batch
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
