#!/bin/bash
# Complete build script for Solana contracts
# Fixes all dependency issues and builds the contracts

set -e

echo "🔧 ShadowStream Contract Build Script"
echo "======================================"

# Step 1: Fix cache files
echo ""
echo "Step 1: Fixing Cargo cache files..."
bash fix-cargo-cache.sh

# Step 2: Set up Solana toolchain
echo ""
echo "Step 2: Setting up Solana toolchain..."
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Step 3: Set up rustup if needed
echo ""
echo "Step 3: Configuring rustup..."
if ! command -v rustup &> /dev/null; then
    echo "⚠️  rustup not found. Installing..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Set default toolchain if not set
if ! rustup show 2>/dev/null | grep -q "default"; then
    echo "Setting rustup default to stable..."
    rustup default stable 2>/dev/null || echo "⚠️  Could not set rustup default - you may need to run: rustup default stable"
fi

# Step 4: Clean build
echo ""
echo "Step 4: Cleaning previous build..."
rm -f Cargo.lock
anchor clean || true

# Step 5: Build
echo ""
echo "Step 5: Building contracts..."
echo "This may take several minutes..."
anchor build

echo ""
echo "✅ Build complete!"
echo ""
echo "Program ID: $(solana-keygen pubkey target/deploy/bulk_payment-keypair.json 2>/dev/null || echo 'Check target/deploy/')"
echo "Deploy with: anchor deploy --provider.cluster devnet"
