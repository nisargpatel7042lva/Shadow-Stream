'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '../../../../lib/trpc'
import { Button } from '../../../../components/ui/button'
import { LoadingSpinner } from '../../../../components/ui/loading'
import { CheckCircle, XCircle, Clock, Shield, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function PaymentBatchPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.id as string

  const { data: batch, isLoading } = trpc.payment.getBatchById.useQuery({
    batchId,
  })

  const executeBatch = trpc.payment.executeBatch.useMutation({
    onSuccess: () => {
      toast.success('Batch executed successfully!')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to execute batch')
    },
  })

  const approveBatch = trpc.payment.approveBatch.useMutation({
    onSuccess: () => {
      toast.success('Batch approved!')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve batch')
    },
  })

  const cancelBatch = trpc.payment.cancelBatch.useMutation({
    onSuccess: () => {
      toast.success('Batch cancelled')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel batch')
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <XCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch not found</h2>
        <p className="text-gray-600 mb-6">The payment batch you're looking for doesn't exist</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (batch.status) {
      case 'COMPLETED':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'APPROVED':
        return <CheckCircle className="h-6 w-6 text-blue-600" />
      case 'EXECUTING':
        return <Clock className="h-6 w-6 text-yellow-600 animate-spin" />
      case 'CANCELLED':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (batch.status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'EXECUTING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">{batch.title}</h1>
            {batch.isPrivate && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Shield className="mr-1 h-3 w-3" />
                Private
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600">{batch.description || 'No description'}</p>
        </div>
        <div className="flex flex-col gap-2">
          {batch.status === 'PENDING' && (
            <>
              <Button
                onClick={() =>
                  approveBatch.mutate({
                    batchId,
                    approved: true,
                  })
                }
                disabled={approveBatch.isPending}
                className="group"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelBatch.mutate({ batchId })}
                disabled={cancelBatch.isPending}
              >
                <XCircle className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </>
          )}
          {batch.status === 'APPROVED' && (
            <Button
              onClick={() => executeBatch.mutate({ batchId })}
              disabled={executeBatch.isPending}
              size="lg"
              className="group"
            >
              {executeBatch.isPending ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Executing...
                </>
              ) : (
                <>
                  Execute Batch
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-600">Status</div>
            {getStatusIcon()}
          </div>
          <div className={`mt-2 inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold ${getStatusColor()}`}>
            {batch.status}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-soft">
          <div className="text-sm font-semibold text-gray-600 mb-2">Total Amount</div>
          <div className="text-3xl font-bold text-gray-900">
            {batch.isPrivate ? (
              <span className="text-gray-400">***</span>
            ) : (
              `${Number(batch.totalAmount).toFixed(4)} SOL`
            )}
          </div>
          {batch.isPrivate && (
            <p className="text-xs text-gray-500 mt-1">Amount encrypted</p>
          )}
        </div>
        <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-purple-50 p-6 shadow-soft">
          <div className="text-sm font-semibold text-gray-600 mb-2">Recipients</div>
          <div className="text-3xl font-bold text-gray-900">{batch.recipientCount}</div>
          <p className="text-xs text-gray-500 mt-1">payments in this batch</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-soft overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-600 mt-1">
            {batch.isPrivate 
              ? 'Amounts are encrypted. Recipients can decrypt their individual payments.'
              : 'Payment details for this batch'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Recipient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Status
                </th>
                {batch.isPrivate && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Privacy
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batch.payments.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-sm font-semibold text-indigo-700 mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {payment.recipient?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {payment.recipientId.slice(0, 8)}...{payment.recipientId.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {batch.isPrivate ? (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-400 font-mono">***</span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-gray-900">
                        {Number(payment.amount).toFixed(4)} SOL
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {payment.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {payment.status}
                    </span>
                  </td>
                  {batch.isPrivate && (
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
