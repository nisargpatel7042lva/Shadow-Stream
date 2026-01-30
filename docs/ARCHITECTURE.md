# ShadowStream Architecture

## Overview

ShadowStream is a private payroll platform built on Solana, designed for Web3 organizations to make batch payments while maintaining privacy through encryption and selective disclosure.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 14 App Router                                │  │
│  │  - Dashboard UI                                       │  │
│  │  - Wallet Integration (Solana Wallet Adapter)         │  │
│  │  - React Query + tRPC Client                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (tRPC)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  tRPC Routers                                         │  │
│  │  - Payment Router (batch creation, execution)        │  │
│  │  - Organization Router (org management)               │  │
│  │  - Invoice Router (invoice handling)                 │  │
│  │  - Privacy Router (encryption/decryption)            │  │
│  │  - Compliance Router (audit reports)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Database Layer         │  │   Privacy Layer           │
│   (PostgreSQL + Prisma)  │  │   (NaCl Box Encryption)   │
│                          │  │                          │
│  - Users                 │  │  - Batch Encryption      │
│  - Organizations         │  │  - Merkle Tree           │
│  - Payment Batches       │  │  - Commitment Hashes     │
│  - Invoices              │  │  - Selective Disclosure  │
│  - Compliance Logs       │  │                          │
└──────────────────────────┘  └──────────────────────────┘
                │                       │
                └───────────┬───────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Solana Blockchain Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Anchor Program (bulk-payment)                       │  │
│  │  - initialize_vault                                  │  │
│  │  - create_batch                                      │  │
│  │  - execute_batch                                     │  │
│  │  - cancel_batch                                      │  │
│  │                                                       │  │
│  │  Accounts:                                           │  │
│  │  - PaymentVault (PDA)                               │  │
│  │  - PaymentBatch (PDA)                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Payment Batch Creation Flow

1. **User Action**: User creates a payment batch via frontend
2. **API Request**: Frontend sends tRPC mutation to `payment.create`
3. **Privacy Processing**: If private, API encrypts recipient amounts using NaCl Box
4. **Database Storage**: Batch metadata stored in PostgreSQL
5. **On-Chain Commitment**: Commitment hash stored on Solana (if private)
6. **Response**: Batch ID returned to frontend

### Payment Execution Flow

1. **User Action**: Admin approves and executes batch
2. **API Request**: Frontend sends tRPC mutation to `payment.execute`
3. **Validation**: API validates batch status and permissions
4. **Solana Transaction**: API constructs and sends Anchor instruction
5. **On-Chain Execution**: Solana program executes transfers atomically
6. **Status Update**: Database updated with execution status
7. **Response**: Transaction signature returned to frontend

### Privacy Flow

1. **Encryption**: When creating private batch, amounts encrypted per recipient
2. **Merkle Tree**: Tree built from encrypted commitments
3. **On-Chain Storage**: Only merkle root stored on-chain
4. **Off-Chain Storage**: Encrypted data stored in database
5. **Decryption**: Recipients decrypt their amounts using their private key
6. **Selective Disclosure**: Organizations can generate audit proofs

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + tRPC
- **Wallet**: Solana Wallet Adapter
- **UI Components**: Custom components + shadcn/ui patterns

### Backend
- **API**: tRPC (type-safe RPC)
- **Database**: PostgreSQL (via Neon.tech)
- **ORM**: Prisma
- **Authentication**: Wallet-based (Solana signatures)

### Blockchain
- **Platform**: Solana
- **Framework**: Anchor 0.32.1
- **Language**: Rust
- **Network**: Devnet (for development)

### Privacy
- **Encryption**: NaCl Box (TweetNaCl.js)
- **Verification**: Merkle Trees
- **Storage**: Hybrid (on-chain commitments, off-chain data)

## Package Structure

```
shadowstream/
├── apps/
│   └── web/                    # Next.js frontend application
├── packages/
│   ├── api/                    # tRPC API routers and context
│   ├── database/               # Prisma schema and database utilities
│   ├── sdk/                    # TypeScript SDK for Solana interactions
│   ├── contracts/              # Solana Anchor programs
│   └── ui/                     # Shared UI components
└── docs/                       # Documentation
```

## Security Considerations

1. **Wallet Authentication**: Users authenticated via Solana wallet signatures
2. **Role-Based Access**: Organizations have admins and members with different permissions
3. **Privacy**: Payment amounts encrypted, only commitments on-chain
4. **Atomic Execution**: Batch payments execute atomically (all or nothing)
5. **Input Validation**: All inputs validated via Zod schemas
6. **Error Handling**: Comprehensive error handling at all layers

## Scalability

- **Batch Size**: Supports up to 50 recipients per batch
- **Database**: PostgreSQL handles concurrent requests
- **Solana**: Leverages Solana's high throughput for on-chain operations
- **Caching**: React Query provides client-side caching

## Deployment

- **Frontend**: Deployable to Vercel, Netlify, or similar
- **Database**: Neon.tech (PostgreSQL cloud)
- **Smart Contracts**: Deploy to Solana devnet/mainnet
- **Environment**: Configure via `.env.local`

## Future Enhancements

- Multi-sig approval workflows
- SPL token support (beyond SOL)
- Integration with privacy protocols (Light Protocol, Arcium)
- Mobile app support
- Advanced compliance features
