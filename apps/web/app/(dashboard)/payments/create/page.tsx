'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../../../../lib/trpc'
import { Button } from '../../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card'
import { ArrowRight, Plus, X, Building2, FileText, Lock, Users } from 'lucide-react'
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
    setRecipients(recipients.filter((_: any, i: number) => i !== index))
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
      .filter((r: any) => r.walletAddress && r.amount)
      .map((r: any) => ({
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Create Payment Batch</h1>
        <p className="text-lg text-foreground-muted">
          Create a new batch payment for your organization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle>Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <select
              value={orgId || ''}
              onChange={(e) => router.push(`/payments/create?org=${e.target.value}`)}
              className="block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              required
            >
              <option value="">Select an organization</option>
              {organizations?.map((org: any) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle>Batch Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                placeholder="e.g., Monthly Payroll - January 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                placeholder="Optional description for this payment batch"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20 border border-success/30 text-success">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle>Privacy Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-border-light bg-background-card text-primary focus:ring-primary/20"
              />
              <div className="flex-1">
                <label htmlFor="isPrivate" className="text-sm font-medium text-foreground block mb-1">
                  Private Payment
                </label>
                <p className="text-sm text-foreground-muted">
                  Encrypt payment amounts off-chain. Only commitment hashes will be stored on-chain, keeping amounts private while maintaining verifiability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 border border-secondary/30 text-secondary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Recipients</CardTitle>
                  <p className="text-sm text-foreground-muted mt-1">
                    Add up to 50 recipients for this batch
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addRecipient} 
                size="sm"
                disabled={recipients.length >= 50}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipients.map((recipient: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border-light bg-background-elevated p-5 transition-all hover:border-primary/50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground-muted">
                      Recipient #{index + 1}
                    </span>
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeRecipient(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        value={recipient.walletAddress}
                        onChange={(e) =>
                          updateRecipient(index, 'walletAddress', e.target.value)
                        }
                        className="block w-full rounded-lg border border-border-light bg-background-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="Enter Solana wallet address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Amount (SOL) *
                      </label>
                      <input
                        type="number"
                        step="0.00000001"
                        value={recipient.amount}
                        onChange={(e) =>
                          updateRecipient(index, 'amount', e.target.value)
                        }
                        className="block w-full rounded-lg border border-border-light bg-background-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Memo (Optional)
                      </label>
                      <input
                        type="text"
                        value={recipient.memo}
                        onChange={(e) =>
                          updateRecipient(index, 'memo', e.target.value)
                        }
                        className="block w-full rounded-lg border border-border-light bg-background-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="Payment memo"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4 border-t border-border-light">
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
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
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
