#!/bin/bash
set -e

echo "📦 Building and deploying Solana contracts..."

cd packages/contracts

# Check if Solana CLI is available
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    echo "   See: packages/contracts/BUILD_SETUP.md"
    exit 1
fi

# Check if Anchor is available
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install it first."
    echo "   See: packages/contracts/BUILD_SETUP.md"
    exit 1
fi

# Set cluster
echo "🌐 Setting cluster to devnet..."
solana config set --url devnet

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance | grep -o '[0-9.]*' | head -1)
if (( $(echo "$BALANCE < 2.0" | bc -l) )); then
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2
fi

# Delete Cargo.lock if it exists (to avoid version 4 incompatibility with Solana's Rust 1.75.0)
echo "🧹 Cleaning Cargo.lock (if exists)..."
rm -f Cargo.lock

# Clear Cargo registry cache for constant_time_eq-0.4.2 (has corrupted edition2024 requirement)
echo "🧹 Clearing corrupted Cargo registry cache..."
rm -rf ~/.cargo/registry/src/index.crates.io-*/constant_time_eq-0.4.2 2>/dev/null || true
rm -rf ~/.cargo/registry/cache/index.crates.io-*/constant_time_eq-0.4.2* 2>/dev/null || true

# Build
echo "🔨 Building contracts..."
# Ensure we use Solana's cargo-build-sbf by setting PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
anchor build

# Get program ID from keypair
PROGRAM_ID=$(solana-keygen pubkey target/deploy/bulk_payment-keypair.json)
echo "📝 Program ID: $PROGRAM_ID"

# Deploy
echo "🚀 Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "✅ Deployment complete!"
echo "📝 Program ID: $PROGRAM_ID"
echo "🔗 Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "⚠️  Update these files with the program ID:"
echo "   - packages/contracts/Anchor.toml"
echo "   - packages/contracts/programs/bulk-payment/src/lib.rs"
echo "   - .env.local (BULK_PAYMENT_PROGRAM_ID)"
