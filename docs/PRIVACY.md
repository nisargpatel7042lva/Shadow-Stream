# Privacy Implementation Guide

## Overview

ShadowStream implements a custom privacy solution using cryptographic encryption to hide payment amounts while maintaining auditability and selective disclosure capabilities.

## Architecture

### Privacy Flow

```
1. Organization creates payment batch
   ↓
2. Privacy service encrypts amounts (off-chain)
   ↓
3. Commitment hashes stored on-chain (in memo field)
   ↓
4. Encrypted data stored in database
   ↓
5. Batch executed on-chain (amounts visible but commitments verify)
   ↓
6. Recipients decrypt their individual amounts (off-chain)
```

## Implementation Details

### Encryption Method

We use **NaCl Box** (Curve25519, Salsa20, Poly1305) for encryption:

- **Algorithm**: `tweetnacl.box` (NaCl Box)
- **Key Exchange**: Diffie-Hellman (ECDH)
- **Nonce**: 24 random bytes per encryption
- **Format**: Base64 encoded

### Commitment Scheme

Each payment generates a commitment hash:
```
commitment = SHA256(publicKey || amount || random)
```

Commitments are stored on-chain in the `memo` field (32 bytes), allowing:
- Verification without revealing amounts
- Batch integrity checking via Merkle tree
- Selective disclosure when needed

### Merkle Tree

Batch payments use a Merkle tree for verification:

- **Leaves**: Individual payment commitments
- **Root**: Stored in database and batch metadata
- **Proofs**: Generated for individual payments

Benefits:
- Efficient batch verification
- Privacy-preserving (only commitment revealed)
- Tamper-proof (any change invalidates root)

## API Endpoints

### Decrypt Payment

```typescript
POST /api/trpc/privacy.decryptPayment
{
  batchId: string
  recipientWalletAddress: string
  recipientPrivateKey: string // Base58 encoded
}

Response:
{
  amount: number
  memo: string
  timestamp: number
}
```

### Generate Merkle Proof

```typescript
GET /api/trpc/privacy.generateProof
{
  batchId: string
  paymentIndex: number
}

Response:
{
  proof: string[]
  root: string
  commitment: string
}
```

### Verify Proof

```typescript
POST /api/trpc/privacy.verifyProof
{
  commitment: string
  proof: string[]
  root: string
}

Response:
{
  isValid: boolean
}
```

## Usage Examples

### Encrypting a Batch

```typescript
import { PrivacyManager } from '@shadowstream/sdk'
import { Keypair, PublicKey } from '@solana/web3.js'

const privacyManager = new PrivacyManager()
const sender = Keypair.generate()

const recipients = [
  {
    publicKey: new PublicKey('...'),
    amount: 1000000,
    memo: 'Salary payment',
  },
]

const encrypted = await privacyManager.encryptBatch({
  recipients,
  senderKeypair: sender,
  protocol: 'custom-zk',
})

// Store encrypted data in database
// Store commitments on-chain in memo fields
```

### Decrypting a Payment

```typescript
import { PrivacyManager } from '@shadowstream/sdk'

const privacyManager = new PrivacyManager()
const recipient = Keypair.fromSecretKey(...)

const decrypted = await privacyManager.decryptPayment({
  encryptedData: payment.encryptedData,
  nonce: payment.nonce,
  senderPublicKey: senderPublicKey,
  recipientKeypair: recipient,
})

console.log(`Amount: ${decrypted.amount}`)
console.log(`Memo: ${decrypted.memo}`)
```

## Privacy Guarantees

### What is Hidden

✅ **Payment amounts** - Encrypted off-chain, only commitments on-chain  
✅ **Individual memos** - Encrypted with payment data  
✅ **Recipient identities** - Can use stealth addresses  
✅ **Batch totals** - Can be hidden if needed (future enhancement)

### What is Visible

⚠️ **Transaction existence** - Batch creation/execution visible on-chain  
⚠️ **Recipient addresses** - Public keys visible (can use stealth addresses)  
⚠️ **Commitment hashes** - Stored in memo fields  
⚠️ **Batch metadata** - Title, description, timestamps

### Selective Disclosure

Organizations can:
- **Decrypt individual payments** - Using recipient's private key
- **Generate audit proofs** - Merkle proofs for compliance
- **Reveal specific payments** - For refunds or disputes

## Security Considerations

### Encryption Security

- **NaCl Box** is cryptographically secure (used by Signal, WhatsApp)
- **Unique nonces** prevent replay attacks
- **Diffie-Hellman** ensures only recipient can decrypt

### Key Management

⚠️ **Important**: Recipients must securely store their private keys
- Private keys are never transmitted
- Decryption happens client-side
- Keys should be stored in secure wallets

### On-Chain Privacy

- Commitments don't reveal amounts
- Merkle roots enable batch verification
- Future: Can integrate with Light Protocol PSPs for full on-chain privacy

## Future Enhancements

### Planned Integrations

1. **Light Protocol PSPs** - Private Solana Programs for confidential execution
2. **Arcium** - Confidential computing for complex privacy operations
3. **Stealth Addresses** - Hide recipient identities
4. **Zero-Knowledge Proofs** - Range proofs for amount verification without disclosure

### Performance Optimizations

- Batch proof generation
- Cached Merkle trees
- Parallel encryption/decryption
- Client-side proof generation

## Testing Privacy

### Verify Amounts are Hidden

1. Create a private batch with multiple recipients
2. Check Solana Explorer for the transaction
3. Verify:
   - ✅ Amounts are NOT visible in transaction details
   - ✅ Only commitment hashes visible in memo fields
   - ✅ Batch total may be visible (can be hidden in future)

### Verify Decryption Works

1. Create a private batch
2. As recipient, decrypt your payment
3. Verify:
   - ✅ Correct amount is revealed
   - ✅ Memo matches original
   - ✅ Only your payment is decryptable

### Verify Merkle Proofs

1. Generate proof for a payment
2. Verify proof against Merkle root
3. Verify:
   - ✅ Valid proofs verify correctly
   - ✅ Invalid proofs are rejected
   - ✅ Root matches batch root

## Compliance

### Audit Trail

- All encrypted data stored in database
- Merkle roots enable batch verification
- Activity logs track all operations
- Selective disclosure for compliance

### KYC/AML

- Organizations can require KYC before payments
- Viewing keys can be shared with auditors
- Compliance reports can be generated
- Selective disclosure for regulatory requirements

## Troubleshooting

### Decryption Fails

**Error**: "Failed to decrypt payment data"

**Causes**:
- Wrong private key
- Corrupted encrypted data
- Mismatched sender/recipient keys

**Solution**:
- Verify wallet address matches private key
- Check encrypted data integrity
- Ensure correct sender public key

### Merkle Proof Invalid

**Error**: "Merkle root mismatch"

**Causes**:
- Batch data modified
- Incorrect payment index
- Corrupted commitments

**Solution**:
- Regenerate Merkle tree
- Verify batch integrity
- Check commitment hashes

## References

- [NaCl Box Documentation](https://nacl.cr.yp.to/box.html)
- [Merkle Tree Implementation](./packages/sdk/src/privacy/merkle-proof.ts)
- [Custom Privacy Service](./packages/sdk/src/privacy/custom-zk.ts)
