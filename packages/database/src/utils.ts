import { db, Prisma } from './index'

/**
 * Database utility functions
 */

/**
 * Get next batch number for an organization
 */
export async function getNextBatchNumber(
  organizationId: string
): Promise<number> {
  const lastBatch = await db.paymentBatch.findFirst({
    where: { organizationId },
    orderBy: { batchNumber: 'desc' },
    select: { batchNumber: true },
  })

  return (lastBatch?.batchNumber || 0) + 1
}

/**
 * Check if user has permission to perform action
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  action: 'createBatch' | 'approveBatch' | 'executeBatch'
): Promise<boolean> {
  const member = await db.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
    },
  })

  if (!member) return false

  switch (action) {
    case 'createBatch':
      return (
        member.canCreateBatch ||
        member.role === 'OWNER' ||
        member.role === 'ADMIN'
      )
    case 'approveBatch':
      return (
        member.canApproveBatch ||
        member.role === 'OWNER' ||
        member.role === 'ADMIN'
      )
    case 'executeBatch':
      return (
        member.canExecuteBatch ||
        member.role === 'OWNER' ||
        member.role === 'ADMIN'
      )
    default:
      return false
  }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string) {
  return await db.organizationMember.findMany({
    where: { userId },
    include: {
      organization: true,
    },
  })
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string) {
  const [batches, payments, invoices] = await Promise.all([
    db.paymentBatch.count({
      where: { organizationId },
    }),
    db.payment.count({
      where: {
        batch: {
          organizationId,
        },
      },
    }),
    db.invoice.count({
      where: { organizationId },
    }),
  ])

  const totalPaid = await db.paymentBatch.aggregate({
    where: {
      organizationId,
      status: 'COMPLETED',
    },
    _sum: {
      totalAmount: true,
    },
  })

  return {
    batches,
    payments,
    invoices,
    totalPaid: totalPaid._sum.totalAmount || 0,
  }
}

/**
 * Get batch with all related data
 */
export async function getBatchWithDetails(batchId: string) {
  return await db.paymentBatch.findUnique({
    where: { id: batchId },
    include: {
      organization: true,
      creator: {
        select: {
          id: true,
          name: true,
          walletAddress: true,
          email: true,
        },
      },
      payments: {
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              walletAddress: true,
            },
          },
        },
      },
      approvals: {
        include: {
          batch: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Create activity log entry
 */
export async function logActivity(params: {
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata?: any
}) {
  return await db.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      ...(params.metadata && { metadata: params.metadata }),
    },
  })
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string) {
  return await db.user.findUnique({
    where: { walletAddress },
  })
}

/**
 * Create or get user by wallet address
 */
export async function getOrCreateUser(walletAddress: string, data?: {
  name?: string
  email?: string
}) {
  let user = await db.user.findUnique({
    where: { walletAddress },
  })

  if (!user) {
    user = await db.user.create({
      data: {
        walletAddress,
        ...data,
      },
    })
  }

  return user
}
