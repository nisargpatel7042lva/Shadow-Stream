'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '../../../../lib/trpc'
import { Button } from '../../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card'
import { LoadingSpinner } from '../../../../components/ui/loading'
import { CheckCircle, XCircle, Clock, Shield, ArrowLeft, ArrowRight, FileText, Users, DollarSign } from 'lucide-react'
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
        <XCircle className="h-16 w-16 text-error mb-4" />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Batch not found</h2>
        <p className="text-foreground-muted mb-6">The payment batch you're looking for doesn't exist</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (batch.status) {
      case 'COMPLETED':
        return <CheckCircle className="h-6 w-6 text-success" />
      case 'APPROVED':
        return <CheckCircle className="h-6 w-6 text-primary" />
      case 'EXECUTING':
        return <Clock className="h-6 w-6 text-warning animate-spin" />
      case 'CANCELLED':
        return <XCircle className="h-6 w-6 text-error" />
      default:
        return <Clock className="h-6 w-6 text-foreground-muted" />
    }
  }

  const getStatusColor = () => {
    switch (batch.status) {
      case 'COMPLETED':
        return 'bg-success/20 text-success border-success/30'
      case 'APPROVED':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'EXECUTING':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'CANCELLED':
        return 'bg-error/20 text-error border-error/30'
      default:
        return 'bg-background-elevated text-foreground-muted border-border-light'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-fade-in-up">
        <div className="flex-1">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-foreground-muted hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-display font-bold text-foreground">{batch.title}</h1>
            {batch.isPrivate && (
              <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                <Shield className="mr-1 h-3 w-3" />
                Private
              </span>
            )}
          </div>
          <p className="text-lg text-foreground-muted">{batch.description || 'No description'}</p>
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
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
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
        <Card className="animate-fade-in-up animate-delay-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground-muted">Status</div>
              {getStatusIcon()}
            </div>
            <div className={`mt-2 inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold ${getStatusColor()}`}>
              {batch.status}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up animate-delay-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-foreground-muted">Total Amount</div>
            </div>
            <div className="text-3xl font-display font-bold text-foreground">
              {batch.isPrivate ? (
                <span className="text-foreground-muted">***</span>
              ) : (
                `${Number(batch.totalAmount).toFixed(4)} SOL`
              )}
            </div>
            {batch.isPrivate && (
              <p className="text-xs text-foreground-muted mt-1">Amount encrypted</p>
            )}
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up animate-delay-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-foreground-muted">Recipients</div>
            </div>
            <div className="text-3xl font-display font-bold text-foreground">{batch.recipientCount}</div>
            <p className="text-xs text-foreground-muted mt-1">payments in this batch</p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up animate-delay-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 border border-secondary/30 text-secondary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Payments</CardTitle>
              <p className="text-sm text-foreground-muted mt-1">
                {batch.isPrivate 
                  ? 'Amounts are encrypted. Recipients can decrypt their individual payments.'
                  : 'Payment details for this batch'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Status
                  </th>
                  {batch.isPrivate && (
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Privacy
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {batch.payments.map((payment: any, index: number) => (
                  <tr key={payment.id} className="hover:bg-background-elevated transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {payment.recipient?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-foreground-muted font-mono">
                            {payment.recipientId.slice(0, 8)}...{payment.recipientId.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {batch.isPrivate ? (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-foreground-muted mr-2" />
                          <span className="text-foreground-muted font-mono">***</span>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-foreground">
                          {Number(payment.amount).toFixed(4)} SOL
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                          payment.status === 'COMPLETED'
                            ? 'bg-success/20 text-success border-success/30'
                            : payment.status === 'PENDING'
                            ? 'bg-warning/20 text-warning border-warning/30'
                            : 'bg-error/20 text-error border-error/30'
                        }`}
                      >
                        {payment.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {payment.status}
                      </span>
                    </td>
                    {batch.isPrivate && (
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-2 py-1 text-xs font-medium text-primary">
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
        </CardContent>
      </Card>
    </div>
  )
}
