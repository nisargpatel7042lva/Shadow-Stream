'use client'

import { useParams } from 'next/navigation'
import { trpc } from '../../../../../lib/trpc'
import { Button } from '../../../../../components/ui/button'
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
    return <div className="text-center">Loading...</div>
  }

  if (!org) {
    return <div className="text-center">Organization not found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vault: {org.vaultAddress.slice(0, 8)}...{org.vaultAddress.slice(-8)}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-600">Total Batches</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.batches || 0}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-600">Total Payments</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.payments || 0}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-600">Total Paid</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats?.totalPaid ? Number(stats.totalPaid).toFixed(2) : '0'} SOL
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm text-gray-600">Invoices</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.invoices || 0}</div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Batches</h2>
        <Link href={`/payments/create?org=${orgId}`}>
          <Button>Create Batch</Button>
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches?.batches.map((batch) => (
                <tr key={batch.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {batch.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      #{batch.batchNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {Number(batch.totalAmount).toFixed(4)} SOL
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {batch.recipientCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        batch.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : batch.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
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
          <div className="p-12 text-center text-gray-500">
            No batches yet
          </div>
        )}
      </div>
    </div>
  )
}
