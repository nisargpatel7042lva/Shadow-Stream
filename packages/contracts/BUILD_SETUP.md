# Build Setup for Solana Contracts

## Prerequisites

The Solana BPF target (`bpfel-unknown-unknown`) is required to build Anchor programs. This requires proper Solana platform tools setup.

## Setup Instructions

### Option 1: Using Solana Install Script (Recommended)

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana-install init 1.18.18
```

### Option 2: Manual Setup

1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install Solana CLI:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

3. Install BPF target:
```bash
rustup target add bpfel-unknown-unknown
```

4. Install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --locked --force
```

## Building

Once the environment is set up:

```bash
cd packages/contracts
anchor build
```

## Testing

```bash
anchor test
```

## Deployment

```bash
anchor deploy --provider.cluster devnet
```

## Troubleshooting

### Error: "Could not find specification for target bpfel-unknown-unknown"

This means the Solana platform tools are not properly installed. Follow the setup instructions above.

### Error: Anchor version mismatch

Make sure Anchor.toml specifies the correct version:
```toml
[toolchain]
anchor_version = "0.32.1"
```

And Cargo.toml uses matching versions:
```toml
anchor-lang = "0.32.1"
anchor-spl = "0.32.1"
```
