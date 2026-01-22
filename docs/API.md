# API Documentation

Complete tRPC API reference for ShadowStream.

## Base URL

```
/api/trpc
```

## Authentication

Most endpoints require authentication. Include user session in context.

## Routers

### Payment Router (`payment.*`)

#### `createBatch`

Create a new payment batch.

**Input:**
```typescript
{
  organizationId: string
  title: string
  description?: string
  recipients: Array<{
    walletAddress: string
    amount: number
    memo?: string
  }>
  tokenMint?: string
  isPrivate?: boolean
  scheduledFor?: Date
}
```

**Output:**
```typescript
{
  success: boolean
  batchId: string
  batchNumber: number
  status: string
  totalAmount: number
}
```

#### `executeBatch`

Execute a pending batch.

**Input:**
```typescript
{
  batchId: string
}
```

**Output:**
```typescript
{
  success: boolean
  signature: string
  batchId: string
}
```

#### `getBatchById`

Get batch details by ID.

**Input:**
```typescript
{
  batchId: string
}
```

**Output:** PaymentBatch with payments and organization

#### `listBatches`

List batches for an organization.

**Input:**
```typescript
{
  organizationId: string
  status?: 'PENDING' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  limit?: number
  cursor?: string
}
```

**Output:**
```typescript
{
  batches: PaymentBatch[]
  nextCursor?: string
}
```

#### `approveBatch`

Approve or reject a batch.

**Input:**
```typescript
{
  batchId: string
  approved: boolean
  comment?: string
}
```

**Output:**
```typescript
{
  success: boolean
}
```

#### `cancelBatch`

Cancel a pending batch.

**Input:**
```typescript
{
  batchId: string
}
```

**Output:**
```typescript
{
  success: boolean
}
```

### Organization Router (`organization.*`)

#### `create`

Create a new organization.

**Input:**
```typescript
{
  name: string
  vaultAddress?: string
}
```

**Output:**
```typescript
{
  success: boolean
  organization: Organization
}
```

#### `getById`

Get organization by ID.

**Input:**
```typescript
{
  organizationId: string
}
```

**Output:** Organization with counts

#### `list`

List user's organizations.

**Output:** Array of organizations with role and permissions

#### `getStats`

Get organization statistics.

**Input:**
```typescript
{
  organizationId: string
}
```

**Output:**
```typescript
{
  batches: number
  payments: number
  invoices: number
  totalPaid: number
}
```

#### `update`

Update organization.

**Input:**
```typescript
{
  organizationId: string
  name?: string
}
```

**Output:**
```typescript
{
  success: boolean
  organization: Organization
}
```

#### `addMember`

Add member to organization.

**Input:**
```typescript
{
  organizationId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'FINANCE' | 'CONTRACTOR'
  canCreateBatch?: boolean
  canApproveBatch?: boolean
  canExecuteBatch?: boolean
}
```

**Output:**
```typescript
{
  success: boolean
  member: OrganizationMember
}
```

#### `removeMember`

Remove member from organization.

**Input:**
```typescript
{
  organizationId: string
  userId: string
}
```

**Output:**
```typescript
{
  success: boolean
}
```

#### `listMembers`

List organization members.

**Input:**
```typescript
{
  organizationId: string
}
```

**Output:** Array of members with user details

### Invoice Router (`invoice.*`)

#### `create`

Create a new invoice.

**Input:**
```typescript
{
  organizationId: string
  title: string
  amount: number
  dueDate?: Date
}
```

**Output:**
```typescript
{
  success: boolean
  invoice: Invoice
}
```

#### `getById`

Get invoice by ID.

**Input:**
```typescript
{
  invoiceId: string
}
```

**Output:** Invoice with organization

#### `list`

List invoices for an organization.

**Input:**
```typescript
{
  organizationId: string
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'
  limit?: number
  cursor?: string
}
```

**Output:**
```typescript
{
  invoices: Invoice[]
  nextCursor?: string
}
```

#### `update`

Update invoice.

**Input:**
```typescript
{
  invoiceId: string
  title?: string
  amount?: number
  dueDate?: Date
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'
}
```

**Output:**
```typescript
{
  success: boolean
  invoice: Invoice
}
```

#### `delete`

Delete a draft invoice.

**Input:**
```typescript
{
  invoiceId: string
}
```

**Output:**
```typescript
{
  success: boolean
}
```

### User Router (`user.*`)

#### `me`

Get current user.

**Output:** User with counts

#### `getByWallet`

Get user by wallet address.

**Input:**
```typescript
{
  walletAddress: string
}
```

**Output:** User (public info only)

#### `getOrCreate`

Create or get user by wallet.

**Input:**
```typescript
{
  walletAddress: string
  name?: string
  email?: string
}
```

**Output:** User

#### `update`

Update user profile.

**Input:**
```typescript
{
  name?: string
  email?: string
}
```

**Output:**
```typescript
{
  success: boolean
  user: User
}
```

#### `getPayments`

Get user's payment history.

**Input:**
```typescript
{
  limit?: number
  cursor?: string
}
```

**Output:**
```typescript
{
  payments: Payment[]
  nextCursor?: string
}
```

### Compliance Router (`compliance.*`)

#### `getActivityLogs`

Get activity logs for an organization.

**Input:**
```typescript
{
  organizationId: string
  limit?: number
  cursor?: string
  action?: string
  entityType?: string
}
```

**Output:**
```typescript
{
  logs: ActivityLog[]
  nextCursor?: string
}
```

#### `getBatchApprovals`

Get batch approvals for an organization.

**Input:**
```typescript
{
  organizationId: string
  batchId?: string
  limit?: number
  cursor?: string
}
```

**Output:**
```typescript
{
  approvals: BatchApproval[]
  nextCursor?: string
}
```

#### `generateReport`

Generate compliance report.

**Input:**
```typescript
{
  organizationId: string
  startDate: Date
  endDate: Date
}
```

**Output:** Compliance report with statistics and batches

### Privacy Router (`privacy.*`)

See [PRIVACY.md](./PRIVACY.md) for privacy API documentation.

## Error Codes

- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server error

## Type Safety

All endpoints are fully type-safe with Zod validation and TypeScript types exported via `AppRouter`.

## Usage Example

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@shadowstream/api'

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})

// Use client
const batches = await client.payment.listBatches.query({
  organizationId: '...',
})
```
