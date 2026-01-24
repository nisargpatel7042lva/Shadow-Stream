'use client'

import { trpc } from '../../../lib/trpc'
import { Button } from '../../../components/ui/button'
import toast from 'react-hot-toast'

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
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <input
                type="text"
                value={user?.walletAddress || ''}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user?.name || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Organizations</h2>
          <div className="space-y-2">
            {user?._count.organizations === 0 ? (
              <p className="text-gray-500">No organizations</p>
            ) : (
              <p className="text-gray-600">
                Member of {user?._count.organizations} organization(s)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
