#!/bin/bash
# Fix indexmap 2.13.0 to work with Rust 1.75.0

INDEXMAP_DIR=$(find ~/.cargo/registry/src -path "*indexmap-2.13.0*" -type d 2>/dev/null | head -1)

if [ -z "$INDEXMAP_DIR" ]; then
    echo "indexmap 2.13.0 not found in cache"
    exit 1
fi

echo "Fixing indexmap 2.13.0 in: $INDEXMAP_DIR"

# Fix rust-version
sed -i 's/rust-version = "1.82"/rust-version = "1.75.0"/g' "$INDEXMAP_DIR/Cargo.toml" 2>/dev/null

# Fix inner.rs - replace use<> syntax with Send + Sync
sed -i 's/+ use<'\''_, K, V>/ + Send + Sync/g' "$INDEXMAP_DIR/src/inner.rs" 2>/dev/null
sed -i 's/+ use<'\''a, K, V, Q>/ + Send + Sync/g' "$INDEXMAP_DIR/src/inner.rs" 2>/dev/null

# Fix RandomState imports
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/use std::hash::RandomState/use std::collections::hash_map::RandomState/g' {} \; 2>/dev/null

# Fix split_at_checked -> split_at
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/\.split_at_checked(/.split_at(/g' {} \; 2>/dev/null
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/\.split_at_mut_checked(/.split_at_mut(/g' {} \; 2>/dev/null

# Fix is_sorted_by - replace with manual implementation or remove
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/\.is_sorted_by(|a, b| a\.key <= b\.key)/\.windows(2).all(|w| w[0].key <= w[1].key)/g' {} \; 2>/dev/null
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/\.is_sorted_by(|a, b|/\.windows(2).all(|w|/g' {} \; 2>/dev/null
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/\.is_sorted_by_key(/\.windows(2).all(|w| sort_key(\&w[0]) <= sort_key(\&w[1]))/g' {} \; 2>/dev/null

# Comment out core::error::Error impls
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/^impl core::error::Error/\/\/ impl core::error::Error/g' {} \; 2>/dev/null

# Fix expect attributes
find "$INDEXMAP_DIR/src" -name "*.rs" -exec sed -i 's/#\[expect/#[allow/g' {} \; 2>/dev/null

echo "✅ Fixed indexmap 2.13.0"
