# Database Package

Prisma schema and database utilities for ShadowStream.

## Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Set up environment:**
```bash
# Set DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/shadowstream?schema=public"
```

3. **Generate Prisma Client:**
```bash
pnpm db:generate
```

4. **Run migrations:**
```bash
pnpm db:migrate
```

5. **Seed database:**
```bash
pnpm db:seed
```

## Database Schema

### Models

- **User** - Platform users (wallet addresses, names, emails)
- **Organization** - Organizations using ShadowStream
- **OrganizationMember** - User-organization relationships with roles
- **PaymentBatch** - Batch payment records
- **Payment** - Individual payments within batches
- **BatchApproval** - Approval records for batches
- **Invoice** - Invoices for organizations
- **ActivityLog** - Audit trail of all actions

### Relationships

- User ↔ OrganizationMember ↔ Organization (many-to-many)
- Organization → PaymentBatch (one-to-many)
- PaymentBatch → Payment (one-to-many)
- PaymentBatch → BatchApproval (one-to-many)
- User → PaymentBatch (creator)
- User → Payment (recipient)

## Scripts

- `db:generate` - Generate Prisma Client
- `db:push` - Push schema to database (dev)
- `db:migrate` - Create and run migrations
- `db:migrate:deploy` - Deploy migrations (production)
- `db:studio` - Open Prisma Studio
- `db:seed` - Seed database with test data
- `db:reset` - Reset database and run seed

## Seed Data

The seed script creates:
- 20 users
- 3 organizations
- Organization members with various roles
- 10 payment batches (various statuses)
- 5 invoices
- Activity logs and approvals

## Usage

```typescript
import { db } from '@shadowstream/database'
import { getNextBatchNumber, checkPermission } from '@shadowstream/database/utils'

// Use Prisma client
const batches = await db.paymentBatch.findMany({
  where: { organizationId: '...' },
})

// Use utilities
const batchNumber = await getNextBatchNumber(organizationId)
const canCreate = await checkPermission(userId, orgId, 'createBatch')
```

## Indexes

All models have appropriate indexes for:
- Foreign keys
- Common query patterns
- Status fields
- Timestamps
- Unique constraints

## Privacy Fields

Payment batches and payments include privacy fields:
- `encryptedData` - Encrypted payment data
- `nonce` - Encryption nonce
- `commitment` - Commitment hash for on-chain verification
- `merkleRoot` - Merkle root for batch verification
