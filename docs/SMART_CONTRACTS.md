# Smart Contracts Documentation

## Overview

ShadowStream uses an Anchor program (`bulk-payment`) deployed on Solana to handle batch payments with privacy features.

## Program ID

**Program ID:** `4FW6DdSzVG1V15MYJWBKqRvQccZQG2LtrLajYFma97ZQ`

**Network:** Devnet

**Explorer Link:** [View on Solana Explorer](https://explorer.solana.com/address/4FW6DdSzVG1V15MYJWBKqRvQccZQG2LtrLajYFma97ZQ?cluster=devnet)

## Instructions

### 1. `initialize_vault`

Initializes a payment vault for an organization.

**Accounts:**
- `vault` - PDA derived from `["vault", authority]`
- `authority` - The organization owner (signer)
- `system_program` - System program

**Returns:**
- `VaultInitialized` event

### 2. `create_batch`

Creates a new payment batch with up to 50 recipients.

**Parameters:**
- `recipients: Vec<Recipient>` - Array of recipients (max 50)
- `token_mint: Option<Pubkey>` - Token mint (None for SOL)
- `batch_id: u64` - Unique batch identifier

**Accounts:**
- `batch` - PDA derived from `["batch", vault, batch_id]`
- `vault` - Payment vault account
- `creator` - Batch creator (signer)
- `system_program` - System program

**Recipient Structure:**
```rust
pub struct Recipient {
    pub address: Pubkey,    // 32 bytes
    pub amount: u64,        // 8 bytes
    pub memo: [u8; 32],     // 32 bytes (can store commitment hash)
}
```

**Returns:**
- `BatchCreated` event

**Errors:**
- `InvalidRecipientCount` - Recipient count must be 1-50

### 3. `execute_batch`

Executes a pending batch, transferring funds to all recipients.

**Accounts:**
- `batch` - Payment batch account
- `vault` - Payment vault account (mut)
- `authority` - Vault authority (signer)
- `system_program` - System program
- `token_program` - Token program (optional, for SPL tokens)
- `remaining_accounts` - Recipient accounts (for SOL) or token accounts (for SPL)

**Returns:**
- `BatchExecuted` event

**Errors:**
- `InvalidBatchStatus` - Batch must be pending
- `InvalidVault` - Vault mismatch
- `InsufficientFunds` - Vault doesn't have enough balance

**Note:** For SOL transfers, recipient accounts must be passed as `remaining_accounts`. For SPL token transfers, token accounts must be passed.

### 4. `cancel_batch`

Cancels a pending batch. Only the creator can cancel.

**Accounts:**
- `batch` - Payment batch account (mut)
- `vault` - Payment vault account
- `authority` - Batch creator (signer)

**Returns:**
- `BatchCancelled` event

**Errors:**
- `CannotCancelExecutedBatch` - Cannot cancel executed batch
- `Unauthorized` - Only creator can cancel

## Account Structures

### PaymentVault

```rust
pub struct PaymentVault {
    pub authority: Pubkey,      // 32 bytes
    pub bump: u8,               // 1 byte
    pub total_paid: u64,        // 8 bytes
    pub batch_count: u64,       // 8 bytes
    pub is_active: bool,        // 1 byte
}
```

**Total Size:** 50 bytes + 8 (discriminator) = 58 bytes

### PaymentBatch

```rust
pub struct PaymentBatch {
    pub vault: Pubkey,              // 32 bytes
    pub creator: Pubkey,            // 32 bytes
    pub batch_id: u64,              // 8 bytes
    pub recipient_count: u8,        // 1 byte
    pub total_amount: u64,          // 8 bytes
    pub token_mint: Option<Pubkey>, // 33 bytes (1 + 32)
    pub status: BatchStatus,        // 1 byte
    pub created_at: i64,            // 8 bytes
    pub executed_at: Option<i64>,   // 9 bytes (1 + 8)
    pub recipients: Vec<Recipient>, // 4 + (recipients * 72)
}
```

**Base Size:** 132 bytes + 8 (discriminator) = 140 bytes
**Per Recipient:** 72 bytes

**Maximum Size (50 recipients):** 140 + (50 * 72) = 3,740 bytes

## Events

### VaultInitialized

```rust
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub authority: Pubkey,
}
```

### BatchCreated

```rust
pub struct BatchCreated {
    pub batch: Pubkey,
    pub vault: Pubkey,
    pub batch_id: u64,
    pub recipient_count: u8,
    pub total_amount: u64,
}
```

### BatchExecuted

```rust
pub struct BatchExecuted {
    pub batch: Pubkey,
    pub total_amount: u64,
    pub recipient_count: u8,
}
```

### BatchCancelled

```rust
pub struct BatchCancelled {
    pub batch: Pubkey,
}
```

## Error Codes

- `InvalidRecipientCount` - Recipient count must be between 1 and 50
- `InvalidBatchStatus` - Batch status is invalid for this operation
- `InvalidVault` - Vault account mismatch
- `CannotCancelExecutedBatch` - Cannot cancel an executed batch
- `Unauthorized` - Caller is not authorized
- `InsufficientFunds` - Vault has insufficient balance

## Compute Unit Optimization

The program is optimized to handle batches of up to 50 recipients within the compute unit limit:

- **Base execution:** ~50k CU
- **Per recipient transfer:** ~7k CU
- **Maximum (50 recipients):** ~400k CU

All transfers are batched in a single transaction to minimize costs.

## Security Considerations

1. **PDA Validation:** All PDAs are validated using seeds
2. **Signer Verification:** All critical operations require signer verification
3. **Status Checks:** Batch status is checked before execution/cancellation
4. **Balance Verification:** Vault balance is checked before execution
5. **Authority Checks:** Only authorized users can execute batches

## Testing

See `packages/contracts/tests/bulk-payment.spec.ts` for comprehensive test suite covering:

- Vault initialization
- Batch creation (single and multiple recipients)
- Batch execution
- Batch cancellation
- Error cases (invalid counts, insufficient funds, unauthorized access)

## Deployment

See `packages/contracts/BUILD_SETUP.md` for build and deployment instructions.

## Privacy Integration

The `memo` field in `Recipient` can store commitment hashes for privacy. Actual encrypted amounts are stored off-chain in the database, while only commitment hashes are stored on-chain.
