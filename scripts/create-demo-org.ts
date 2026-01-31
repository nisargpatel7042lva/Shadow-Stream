#!/usr/bin/env tsx
/**
 * Quick script to create a demo organization for judging
 * This creates a user with your wallet address and a sample organization
 */

import { db, getOrCreateUser } from '../packages/database/src'
import { Keypair } from '@solana/web3.js'

// Your wallet address from the logs
const DEMO_WALLET_ADDRESS = '8MKVx6ivtZxypxhRAw7aYUeB3CEMb223tdKyJWe4Va27'

async function createDemoOrg() {
  console.log('🎯 Creating demo organization for judging...')
  console.log(`📝 Wallet address: ${DEMO_WALLET_ADDRESS}`)

  try {
    // Create or get user
    console.log('\n👤 Creating/getting user...')
    const user = await getOrCreateUser(DEMO_WALLET_ADDRESS, {
      name: 'Demo User',
      email: 'demo@shadowstream.io',
    })
    console.log(`✅ User created/found: ${user.id}`)

    // Create demo organization
    console.log('\n🏢 Creating demo organization...')
    const vaultAddress = Keypair.generate().publicKey.toBase58()
    const org = await db.organization.create({
      data: {
        name: 'ShadowStream Demo Corp',
        vaultAddress,
      },
    })
    console.log(`✅ Organization created: ${org.id}`)
    console.log(`   Name: ${org.name}`)
    console.log(`   Vault: ${vaultAddress}`)

    // Add user as owner
    console.log('\n👥 Adding user as organization owner...')
    const member = await db.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'OWNER',
        canCreateBatch: true,
        canApproveBatch: true,
        canExecuteBatch: true,
      },
    })
    console.log(`✅ Member created: ${member.id}`)

    console.log('\n✨ Demo organization created successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Organization ID: ${org.id}`)
    console.log(`   Organization Name: ${org.name}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   User Wallet: ${user.walletAddress}`)
    console.log(`   Role: OWNER`)
    console.log('\n🎉 You can now view this organization in the dashboard!')
    console.log(`   URL: http://localhost:3000/dashboard/organizations/${org.id}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating demo organization:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
      console.error('   Stack:', error.stack)
    }
    process.exit(1)
  }
}

createDemoOrg()
