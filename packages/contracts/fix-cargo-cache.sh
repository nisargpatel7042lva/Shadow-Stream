#!/bin/bash
# Script to fix corrupted Cargo registry cache for dependencies requiring newer Rust versions

echo "🔧 Fixing Cargo registry cache for incompatible dependencies..."

# Fix constant_time_eq edition2024 and rust-version issues
echo "Fixing constant_time_eq edition2024 and rust-version issues..."
find ~/.cargo/registry/src -name "constant_time_eq-0.4.2" -type d 2>/dev/null | while read dir; do
    if [ -f "$dir/Cargo.toml" ]; then
        echo "Fixing: $dir/Cargo.toml"
        sed -i 's/edition = "2024"/edition = "2021"/g' "$dir/Cargo.toml" 2>/dev/null
        sed -i 's/rust-version = "1.85.0"/rust-version = "1.75.0"/g' "$dir/Cargo.toml" 2>/dev/null
        sed -i 's/rust-version = "1.8[0-9]"/rust-version = "1.75.0"/g' "$dir/Cargo.toml" 2>/dev/null
    fi
done

# Fix toml_parser rust-version requirement
echo "Fixing toml_parser rust-version requirement..."
find ~/.cargo/registry/src -path "*/toml_parser-1.0.6*" -name "Cargo.toml" -type f 2>/dev/null | while read file; do
    echo "Fixing: $file"
    # Remove or comment out rust-version requirement, or change it to 1.75.0
    sed -i 's/^rust-version = "1.76"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sed -i '/^rust-version = /d' "$file" 2>/dev/null || \
    sudo sed -i 's/^rust-version = "1.76"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sudo sed -i '/^rust-version = /d' "$file" 2>/dev/null
done

# Fix borsh and borsh-derive rust-version requirements
echo "Fixing borsh and borsh-derive rust-version requirements..."
for crate in "borsh-1.6.0" "borsh-derive-1.6.0"; do
    find ~/.cargo/registry/src -path "*${crate}*" -name "Cargo.toml" -type f 2>/dev/null | while read file; do
        echo "Fixing: $file"
        sed -i 's/rust-version = "1.77.0"/rust-version = "1.75.0"/g' "$file" 2>/dev/null
        sed -i 's/rust-version = "1.77"/rust-version = "1.75.0"/g' "$file" 2>/dev/null
    done
done

# Fix indexmap, toml_datetime, and any other dependencies requiring newer Rust
echo "Fixing all dependencies with rust-version requirements >= 1.76..."
# Find all Cargo.toml files with rust-version >= 1.76
find ~/.cargo/registry/src -name "Cargo.toml" -type f -exec grep -l 'rust-version = "1.[7-9]' {} \; 2>/dev/null | while read file; do
    echo "Fixing rust-version in: $file"
    # Change any rust-version >= 1.76 to 1.75.0, or remove it
    # Try without sudo first, then with sudo if needed
    sed -i 's/^rust-version = "1.[7-9][0-9]"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sed -i 's/^rust-version = "1.7[6-9]"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sed -i 's/^rust-version = "1.76"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sed -i '/^rust-version = /d' "$file" 2>/dev/null || true
done

# Also fix with sudo for files that need elevated permissions
echo "Fixing rust-version with sudo for permission-restricted files..."
find ~/.cargo/registry/src -name "Cargo.toml" -type f -exec grep -l 'rust-version = "1.[7-9]' {} \; 2>/dev/null | while read file; do
    # Try sudo if regular sed didn't work
    sudo sed -i 's/^rust-version = "1.[7-9][0-9]"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sudo sed -i 's/^rust-version = "1.7[6-9]"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sudo sed -i 's/^rust-version = "1.76"/rust-version = "1.75.0"/g' "$file" 2>/dev/null || \
    sudo sed -i '/^rust-version = /d' "$file" 2>/dev/null || true
done

# Fix any other edition2024 issues
echo "Fixing any other edition2024 issues..."
find ~/.cargo/registry/src -name "Cargo.toml" -type f -exec grep -l 'edition = "2024"' {} \; 2>/dev/null | while read file; do
    echo "Fixing edition2024 in: $file"
    sed -i 's/edition = "2024"/edition = "2021"/g' "$file" 2>/dev/null || sudo sed -i 's/edition = "2024"/edition = "2021"/g' "$file" 2>/dev/null
done

echo "✅ Cache fixes applied. You may need to run with sudo if you see permission errors."
echo ""
echo "If you see permission errors, run:"
echo "  sudo bash fix-cargo-cache.sh"
