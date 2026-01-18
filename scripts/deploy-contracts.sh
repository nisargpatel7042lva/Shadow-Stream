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

# Build
echo "🔨 Building contracts..."
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
