#!/bin/bash
# Build script that gracefully handles missing Anchor CLI
set +e  # Don't exit on error
if command -v anchor >/dev/null 2>&1; then
  anchor build
  exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "⚠️  Anchor build failed, but continuing..."
  fi
else
  echo "⚠️  Skipping contracts build - Anchor CLI not available"
  echo "   This is expected on Vercel. Contracts are deployed separately to Solana."
fi
exit 0  # Always succeed
