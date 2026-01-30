#!/bin/bash
# Script to fix corrupted Cargo registry cache for constant_time_eq

echo "🔧 Fixing Cargo registry cache for constant_time_eq..."

# Clear corrupted constant_time_eq-0.4.2 from registry cache
echo "Removing corrupted constant_time_eq-0.4.2 from cache..."
rm -rf ~/.cargo/registry/src/index.crates.io-*/constant_time_eq-0.4.2 2>/dev/null
rm -rf ~/.cargo/registry/cache/index.crates.io-*/constant_time_eq-0.4.2* 2>/dev/null

# Also clear git cache if it exists
rm -rf ~/.cargo/git/db/constant_time_eq-* 2>/dev/null

echo "✅ Cache cleared. You may need to run with sudo if you see permission errors."
echo ""
echo "If you see permission errors, run:"
echo "  sudo rm -rf ~/.cargo/registry/src/index.crates.io-*/constant_time_eq-0.4.2"
echo "  sudo rm -rf ~/.cargo/registry/cache/index.crates.io-*/constant_time_eq-0.4.2*"
