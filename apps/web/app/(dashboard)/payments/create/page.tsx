'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../../../../lib/trpc'
import { Button } from '../../../../components/ui/button'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreatePaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { publicKey } = useWallet()
  const orgId = searchParams.get('org')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [recipients, setRecipients] = useState([
    { walletAddress: '', amount: '', memo: '' },
  ])
  const [isPrivate, setIsPrivate] = useState(true)

  const { data: organizations } = trpc.organization.list.useQuery()
  const createBatch = trpc.payment.createBatch.useMutation({
    onSuccess: (data) => {
      toast.success('Payment batch created successfully!')
      router.push(`/payments/${data.batchId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create batch')
    },
  })

  const addRecipient = () => {
    if (recipients.length < 50) {
      setRecipients([...recipients, { walletAddress: '', amount: '', memo: '' }])
    }
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: string, value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orgId) {
      toast.error('Please select an organization')
      return
    }

    const validRecipients = recipients
      .filter((r) => r.walletAddress && r.amount)
      .map((r) => ({
        walletAddress: r.walletAddress,
        amount: parseFloat(r.amount),
        memo: r.memo || undefined,
      }))

    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient')
      return
    }

    createBatch.mutate({
      organizationId: orgId,
      title,
      description: description || undefined,
      recipients: validRecipients,
      isPrivate,
    })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Payment Batch</h1>
        <p className="text-lg text-gray-600">
          Create a new batch payment for your organization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Organization *
          </label>
          <select
            value={orgId || ''}
            onChange={(e) => router.push(`/payments/create?org=${e.target.value}`)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            required
          >
            <option value="">Select an organization</option>
            {organizations?.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="e.g., Monthly Payroll - January 2024"
            required
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="Optional description for this payment batch"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="ml-3">
              <label htmlFor="isPrivate" className="text-sm font-semibold text-gray-900">
                Private Payment
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Encrypt payment amounts off-chain. Only commitment hashes will be stored on-chain, keeping amounts private while maintaining verifiability.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Recipients *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Add up to 50 recipients for this batch
              </p>
            </div>
            <Button 
              type="button" 
              onClick={addRecipient} 
              size="sm" 
              variant="outline"
              disabled={recipients.length >= 50}
            >
              Add Recipient
            </Button>
          </div>

          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 transition-all hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Recipient #{index + 1}
                  </span>
                  {recipients.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={recipient.walletAddress}
                      onChange={(e) =>
                        updateRecipient(index, 'walletAddress', e.target.value)
                      }
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="Enter Solana wallet address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Amount (SOL) *
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={recipient.amount}
                      onChange={(e) =>
                        updateRecipient(index, 'amount', e.target.value)
                      }
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Memo (Optional)
                    </label>
                    <input
                      type="text"
                      value={recipient.memo}
                      onChange={(e) =>
                        updateRecipient(index, 'memo', e.target.value)
                      }
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="Payment memo"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            size="lg"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createBatch.isPending}
            size="lg"
            className="group"
          >
            {createBatch.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              <>
                Create Batch
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
