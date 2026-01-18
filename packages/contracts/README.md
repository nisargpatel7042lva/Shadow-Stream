# Bulk Payment Smart Contract

Solana Anchor program for batch payments with privacy support.

## Quick Start

1. **Setup environment** (see BUILD_SETUP.md):
```bash
# Install Solana platform tools
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

2. **Build:**
```bash
anchor build
```

3. **Test:**
```bash
anchor test
```

4. **Deploy:**
```bash
anchor deploy --provider.cluster devnet
```

## Program Details

- **Program ID:** `4FW6DdSzVG1V15MYJWBKqRvQccZQG2LtrLajYFma97ZQ`
- **Network:** Devnet
- **Max Recipients:** 50 per batch
- **Supported Tokens:** SOL, USDC, USDT (any SPL token)

## Instructions

1. `initialize_vault` - Create a payment vault
2. `create_batch` - Create a payment batch (up to 50 recipients)
3. `execute_batch` - Execute pending batch
4. `cancel_batch` - Cancel pending batch

## Testing

Comprehensive test suite with 10+ tests covering:
- Vault initialization
- Batch creation (single/multiple recipients)
- Batch execution
- Batch cancellation
- Error cases

Run tests:
```bash
anchor test
```

## Documentation

- [Full Documentation](../../docs/SMART_CONTRACTS.md)
- [Build Setup](BUILD_SETUP.md)
