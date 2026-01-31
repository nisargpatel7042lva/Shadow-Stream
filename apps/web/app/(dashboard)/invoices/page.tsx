'use client'

import { useState } from 'react'
import { trpc } from '../../../lib/trpc'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/ui/loading'
import { FileText, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function InvoicesPage() {
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const { data: organizations } = trpc.organization.list.useQuery()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage invoices for your organizations
          </p>
        </div>
        <Button size="lg" className="group">
          <Plus className="mr-2 h-5 w-5" />
          Create Invoice
        </Button>
      </div>

      {organizations && organizations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Filter by Organization
          </label>
          <select
            value={selectedOrg || ((organizations[0] as any)?.id ?? '')}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {organizations.map((org: any) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-soft overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Invoice List</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invoices?.invoices.map((invoice: any) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {invoice.title}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {Number(invoice.amount).toFixed(4)} SOL
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                        invoice.status === 'PAID'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : invoice.status === 'SENT'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : invoice.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {invoice.status === 'PAID' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {invoice.status === 'SENT' && <Clock className="h-3 w-3 mr-1" />}
                      {invoice.status === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
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
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-6">
              Create your first invoice to get started
            </p>
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Create Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
