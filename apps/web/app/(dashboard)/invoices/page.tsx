'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { trpc } from '../../../lib/trpc'
import { Button } from '../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/ui/loading'
import { FileText, Plus, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function InvoicesPage() {
  const { publicKey } = useWallet()
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const { data: organizations } = trpc.organization.list.useQuery(
    { walletAddress: publicKey?.toBase58() },
    { enabled: !!publicKey }
  )
  const { data: invoices, isLoading } = trpc.invoice.list.useQuery(
    {
      organizationId: selectedOrg || ((organizations?.[0] as any)?.id ?? ''),
    },
    { enabled: !!organizations && organizations.length > 0 }
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Invoices</h1>
          <p className="mt-2 text-lg text-foreground-muted">
            Manage invoices for your organizations
          </p>
        </div>
        <Button size="lg" className="group">
          <Plus className="mr-2 h-5 w-5" />
          Create Invoice
        </Button>
      </div>

      {organizations && organizations.length > 0 && (
        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle>Filter by Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <select
              value={selectedOrg || ((organizations[0] as any)?.id ?? '')}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            >
              {organizations.map((org: any) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in-up animate-delay-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle>Invoice List</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {invoices?.invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-background-elevated transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        {invoice.title}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        {Number(invoice.amount).toFixed(4)} SOL
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                          invoice.status === 'PAID'
                            ? 'bg-success/20 text-success border-success/30'
                            : invoice.status === 'SENT'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : invoice.status === 'CANCELLED'
                            ? 'bg-error/20 text-error border-error/30'
                            : 'bg-background-elevated text-foreground-muted border-border-light'
                        }`}
                      >
                        {invoice.status === 'PAID' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {invoice.status === 'SENT' && <Clock className="h-3 w-3 mr-1" />}
                        {invoice.status === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground-muted">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/invoices/${invoice.id}`}>
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
          {invoices?.invoices.length === 0 && (
            <div className="p-16 text-center">
              <FileText className="mx-auto h-16 w-16 text-foreground-muted mb-4" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No invoices found</h3>
              <p className="text-foreground-muted mb-6">
                Create your first invoice to get started
              </p>
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Create Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
