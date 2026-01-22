import { TRPCError } from '@trpc/server'
import { db } from '@shadowstream/database'
import { checkPermission } from '@shadowstream/database/utils'

/**
 * Check if user has permission for an organization
 */
export async function requirePermission(
  userId: string,
  organizationId: string,
  action: 'createBatch' | 'approveBatch' | 'executeBatch'
): Promise<void> {
  const hasPermission = await checkPermission(userId, organizationId, action)

  if (!hasPermission) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You do not have permission to ${action} in this organization`,
    })
  }
}

/**
 * Check if user is member of organization
 */
export async function requireOrgMembership(
  userId: string,
  organizationId: string
): Promise<void> {
  const member = await db.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
    },
  })

  if (!member) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this organization',
    })
  }
}

/**
 * Check if user owns or has admin role in organization
 */
export async function requireOrgAdmin(
  userId: string,
  organizationId: string
): Promise<void> {
  const member = await db.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
      role: {
        in: ['OWNER', 'ADMIN'],
      },
    },
  })

  if (!member) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an owner or admin to perform this action',
    })
  }
}
