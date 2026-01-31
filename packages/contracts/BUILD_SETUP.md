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

### Error: "package `toml_parser` requires rustc 1.76 or newer"

**Issue**: The `toml_parser` dependency (build-time dependency from cargo) requires Rust 1.76+, but Solana's Rust 1.75.0 doesn't support it.

**Solution**: Update Solana toolchain to latest stable version:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana-install init stable
```

Then rebuild:
```bash
cd packages/contracts
rm -f Cargo.lock
anchor clean
anchor build
```

### Error: "feature edition2024 is required" for constant_time_eq

**Issue**: The `constant_time_eq` dependency version 0.4.2 requires Rust edition2024, but Solana's Rust 1.75.0 doesn't support it.

**Solution**: This is already fixed in `Cargo.toml` using `[patch.crates-io]` to use version 0.2.6 from git. If you still encounter issues:

1. Clear Cargo cache:
   ```bash
   rm -rf ~/.cargo/registry/src/index.crates.io-*/constant_time_eq-0.4.2
   rm -rf ~/.cargo/registry/cache/index.crates.io-*/constant_time_eq-0.4.2*
   rm -rf ~/.cargo/git/db/constant_time_eq-*
   ```

2. Remove Cargo.lock and rebuild:
   ```bash
   cd packages/contracts
   rm -f Cargo.lock
   anchor build
   ```

3. **Alternative**: Upgrade Solana to latest version with newer Rust support:
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   solana-install init stable
   ```

**Note**: The build script (`build.sh`) gracefully handles build failures, so the monorepo build won't fail even if contracts can't build (useful for CI/CD environments where Anchor isn't available).
