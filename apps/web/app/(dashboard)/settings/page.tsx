'use client'

import { trpc } from '../../../lib/trpc'
import { Button } from '../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card'
import toast from 'react-hot-toast'
import { User, Building2, Mail, Wallet } from 'lucide-react'

export default function SettingsPage() {
  const { data: user } = trpc.user.me.useQuery()
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateUser.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="mb-2 text-4xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-foreground-muted">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <User className="h-5 w-5" />
              </div>
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-foreground-muted" />
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={user?.walletAddress || ''}
                  disabled
                  className="mt-1 block w-full rounded-xl border border-border-light bg-background-elevated px-4 py-3 text-foreground-muted focus:outline-none disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-foreground-muted" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name || ''}
                  className="mt-1 block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-foreground-muted" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user?.email || ''}
                  className="mt-1 block w-full rounded-xl border border-border-light bg-background-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle>Organizations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {((user as any)?._count?.organizations ?? 0) === 0 ? (
                <p className="text-foreground-muted">No organizations</p>
              ) : (
                <p className="text-foreground">
                  Member of <span className="font-semibold text-primary">{(user as any)?._count?.organizations ?? 0}</span> organization(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
