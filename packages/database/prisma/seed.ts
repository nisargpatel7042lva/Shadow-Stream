import { PrismaClient } from '@prisma/client'
import { Keypair } from '@solana/web3.js'

const prisma = new PrismaClient()

/**
 * Generate a Solana wallet address (for demo purposes)
 */
function generateWalletAddress(): string {
  return Keypair.generate().publicKey.toBase58()
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.activityLog.deleteMany()
  await prisma.batchApproval.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.paymentBatch.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.organizationMember.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  // Create 20 users
  console.log('👥 Creating users...')
  const users = []
  const userNames = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Wilson',
    'Frank Miller', 'Grace Lee', 'Henry Davis', 'Ivy Chen', 'Jack Taylor',
    'Kate Williams', 'Liam O\'Brien', 'Mia Rodriguez', 'Noah Anderson', 'Olivia Martinez',
    'Paul Thompson', 'Quinn Parker', 'Rachel Green', 'Sam Wilson', 'Tina Turner'
  ]

  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        walletAddress: generateWalletAddress(),
        name: userNames[i],
        email: `user${i + 1}@shadowstream.io`,
      },
    })
    users.push(user)
  }

  console.log(`✅ Created ${users.length} users`)

  // Create 3 organizations
  console.log('🏢 Creating organizations...')
  const organizations = []

  const orgData = [
    {
      name: 'Acme Corporation',
      vaultAddress: generateWalletAddress(),
    },
    {
      name: 'TechStart Inc',
      vaultAddress: generateWalletAddress(),
    },
    {
      name: 'Global Services Ltd',
      vaultAddress: generateWalletAddress(),
    },
  ]

  for (const orgInfo of orgData) {
    const org = await prisma.organization.create({
      data: orgInfo,
    })
    organizations.push(org)
  }

  console.log(`✅ Created ${organizations.length} organizations`)

  // Create organization members
  console.log('👥 Creating organization members...')
  
  // Org 1: Acme Corporation
  await prisma.organizationMember.create({
    data: {
      organizationId: organizations[0].id,
      userId: users[0].id,
      role: 'OWNER',
      canCreateBatch: true,
      canApproveBatch: true,
      canExecuteBatch: true,
    },
  })

  await prisma.organizationMember.create({
    data: {
      organizationId: organizations[0].id,
      userId: users[1].id,
      role: 'ADMIN',
      canCreateBatch: true,
      canApproveBatch: true,
      canExecuteBatch: true,
    },
  })

  await prisma.organizationMember.create({
    data: {
      organizationId: organizations[0].id,
      userId: users[2].id,
      role: 'FINANCE',
      canCreateBatch: true,
      canApproveBatch: false,
      canExecuteBatch: true,
    },
  })

  // Add contractors
  for (let i = 3; i < 8; i++) {
    await prisma.organizationMember.create({
      data: {
        organizationId: organizations[0].id,
        userId: users[i].id,
        role: 'CONTRACTOR',
        canCreateBatch: false,
        canApproveBatch: false,
        canExecuteBatch: false,
      },
    })
  }

  // Org 2: TechStart Inc
  await prisma.organizationMember.create({
    data: {
      organizationId: organizations[1].id,
      userId: users[8].id,
      role: 'OWNER',
      canCreateBatch: true,
      canApproveBatch: true,
      canExecuteBatch: true,
    },
  })

  await prisma.organizationMember.create({
    data: {
      organizationId: organizations[1].id,
      userId: users[9].id,
      role: 'ADMIN',
      canCreateBatch: true,
      canApproveBatch: true,
      canExecuteBatch: false,
    },
  })

  for (let i = 10; i < 15; i++) {
    await prisma.organizationMember.create({
      data: {
        organizationId: organizations[1].id,
        userId: users[i].id,
        role: 'CONTRACTOR',
        canCreateBatch: false,
        canApproveBatch: false,
        canExecuteBatch: false,
      },
    })
  }

  // Org 3: Global Services Ltd
  await prisma.organizationMember.create({
    data: {
      organizationId: organizations[2].id,
      userId: users[15].id,
      role: 'OWNER',
      canCreateBatch: true,
      canApproveBatch: true,
      canExecuteBatch: true,
    },
  })

  for (let i = 16; i < 20; i++) {
    await prisma.organizationMember.create({
      data: {
        organizationId: organizations[2].id,
        userId: users[i].id,
        role: 'CONTRACTOR',
        canCreateBatch: false,
        canApproveBatch: false,
        canExecuteBatch: false,
      },
    })
  }

  console.log('✅ Created organization members')

  // Create 10 payment batches
  console.log('💰 Creating payment batches...')
  const batches = []

  // Batch 1: Acme Corporation - Monthly payroll (completed)
  const batch1 = await prisma.paymentBatch.create({
    data: {
      organizationId: organizations[0].id,
      batchNumber: 1,
      title: 'Monthly Payroll - January 2024',
      description: 'Regular monthly salary payments',
      totalAmount: 50000000, // 50 SOL
      recipientCount: 5,
      isPrivate: true,
      privacyProtocol: 'custom-zk',
      status: 'COMPLETED',
      signature: '5'.repeat(88), // Mock signature
      createdBy: users[0].id,
      approvedBy: users[1].id,
      approvedAt: new Date('2024-01-15'),
      executedAt: new Date('2024-01-15'),
      merkleRoot: '0x' + 'a'.repeat(64),
    },
  })
  batches.push(batch1)

  // Create payments for batch 1
  const batch1Amounts = [10000000, 12000000, 8000000, 10000000, 10000000]
  for (let i = 0; i < 5; i++) {
    await prisma.payment.create({
      data: {
        batchId: batch1.id,
        recipientId: users[3 + i].walletAddress,
        amount: batch1Amounts[i],
        status: 'COMPLETED',
        processedAt: new Date('2024-01-15'),
        commitment: '0x' + (i + 1).toString().repeat(64).slice(0, 64),
      },
    })
  }

  // Batch 2: Acme Corporation - Bonus payments (pending)
  const batch2 = await prisma.paymentBatch.create({
    data: {
      organizationId: organizations[0].id,
      batchNumber: 2,
      title: 'Q4 Performance Bonuses',
      description: 'Performance bonuses for Q4 2023',
      totalAmount: 20000000, // 20 SOL
      recipientCount: 3,
      isPrivate: true,
      privacyProtocol: 'custom-zk',
      status: 'PENDING',
      createdBy: users[2].id,
    },
  })
  batches.push(batch2)

  for (let i = 0; i < 3; i++) {
    await prisma.payment.create({
      data: {
        batchId: batch2.id,
        recipientId: users[3 + i].walletAddress,
        amount: (i + 1) * 5000000,
        status: 'PENDING',
        commitment: '0x' + (i + 10).toString().repeat(64).slice(0, 64),
      },
    })
  }

  // Batch 3: TechStart Inc - Contractor payments (approved)
  const batch3 = await prisma.paymentBatch.create({
    data: {
      organizationId: organizations[1].id,
      batchNumber: 1,
      title: 'Contractor Payments - Week 1',
      description: 'Weekly contractor payments',
      totalAmount: 15000000, // 15 SOL
      recipientCount: 5,
      isPrivate: false,
      status: 'APPROVED',
      createdBy: users[8].id,
      approvedBy: users[9].id,
      approvedAt: new Date(),
    },
  })
  batches.push(batch3)

  for (let i = 0; i < 5; i++) {
    await prisma.payment.create({
      data: {
        batchId: batch3.id,
        recipientId: users[10 + i].walletAddress,
        amount: 3000000,
        status: 'PENDING',
      },
    })
  }

  // Batch 4-10: Additional batches
  const batchTitles = [
    'Project Milestone Payment',
    'Freelancer Payments',
    'Monthly Retainer',
    'Ad-hoc Services',
    'Consulting Fees',
    'Development Sprint Payment',
    'Design Services Payment',
  ]

  for (let i = 0; i < 7; i++) {
    const orgIndex = i % 3
    const org = organizations[orgIndex]
    const creator = users[orgIndex * 5]

    const batch = await prisma.paymentBatch.create({
      data: {
        organizationId: org.id,
        batchNumber: i + (orgIndex === 0 ? 3 : orgIndex === 1 ? 2 : 1),
        title: batchTitles[i],
        description: `Payment batch for ${batchTitles[i]}`,
        totalAmount: (i + 1) * 5000000,
        recipientCount: Math.min(3 + i, 10),
        isPrivate: i % 2 === 0,
        privacyProtocol: i % 2 === 0 ? 'custom-zk' : null,
        status: ['COMPLETED', 'APPROVED', 'PENDING', 'EXECUTING'][i % 4],
        createdBy: creator.id,
        ...(i % 4 === 0 && {
          signature: '5'.repeat(88),
          executedAt: new Date(),
        }),
        ...(i % 4 === 1 && {
          approvedBy: creator.id,
          approvedAt: new Date(),
        }),
      },
    })
    batches.push(batch)

    // Create payments for this batch
    const recipientCount = Math.min(3 + i, 10)
    for (let j = 0; j < recipientCount; j++) {
      await prisma.payment.create({
        data: {
          batchId: batch.id,
          recipientId: users[(orgIndex * 5 + j) % users.length].walletAddress,
          amount: (j + 1) * 1000000,
          status: batch.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
          ...(batch.status === 'COMPLETED' && {
            processedAt: new Date(),
          }),
          ...(batch.isPrivate && {
            commitment: '0x' + (i * 10 + j).toString().repeat(64).slice(0, 64),
          }),
        },
      })
    }
  }

  console.log(`✅ Created ${batches.length} payment batches`)

  // Create 5 invoices
  console.log('📄 Creating invoices...')
  const invoices = []

  const invoiceData = [
    {
      organizationId: organizations[0].id,
      title: 'Q1 2024 Services Invoice',
      amount: 100000000, // 100 SOL
      status: 'PAID',
      dueDate: new Date('2024-03-31'),
      paidAt: new Date('2024-03-15'),
    },
    {
      organizationId: organizations[1].id,
      title: 'Development Services - January',
      amount: 50000000, // 50 SOL
      status: 'SENT',
      dueDate: new Date('2024-02-15'),
    },
    {
      organizationId: organizations[2].id,
      title: 'Consulting Services Invoice',
      amount: 30000000, // 30 SOL
      status: 'DRAFT',
    },
    {
      organizationId: organizations[0].id,
      title: 'Q2 2024 Services Invoice',
      amount: 120000000, // 120 SOL
      status: 'SENT',
      dueDate: new Date('2024-06-30'),
    },
    {
      organizationId: organizations[1].id,
      title: 'Maintenance Contract - February',
      amount: 25000000, // 25 SOL
      status: 'PAID',
      dueDate: new Date('2024-02-28'),
      paidAt: new Date('2024-02-25'),
    },
  ]

  for (const invoiceInfo of invoiceData) {
    const invoice = await prisma.invoice.create({
      data: invoiceInfo,
    })
    invoices.push(invoice)
  }

  console.log(`✅ Created ${invoices.length} invoices`)

  // Create activity logs
  console.log('📝 Creating activity logs...')
  
  // Logs for batch creation
  for (const batch of batches.slice(0, 5)) {
    await prisma.activityLog.create({
      data: {
        userId: batch.createdBy,
        action: 'batch.created',
        entityType: 'PaymentBatch',
        entityId: batch.id,
        metadata: {
          title: batch.title,
          recipientCount: batch.recipientCount,
          totalAmount: batch.totalAmount.toString(),
        },
      },
    })
  }

  // Logs for batch execution
  for (const batch of batches.filter(b => b.status === 'COMPLETED')) {
    await prisma.activityLog.create({
      data: {
        userId: batch.approvedBy || batch.createdBy,
        action: 'batch.executed',
        entityType: 'PaymentBatch',
        entityId: batch.id,
        metadata: {
          signature: batch.signature,
        },
      },
    })
  }

  // Logs for approvals
  for (const batch of batches.filter(b => b.approvedBy)) {
    await prisma.batchApproval.create({
      data: {
        batchId: batch.id,
        approverId: batch.approvedBy!,
        approved: true,
        comment: 'Approved for execution',
      },
    })
  }

  console.log('✅ Created activity logs and approvals')

  console.log('\n✅ Seeding completed!')
  console.log(`\nSummary:`)
  console.log(`- Users: ${users.length}`)
  console.log(`- Organizations: ${organizations.length}`)
  console.log(`- Payment Batches: ${batches.length}`)
  console.log(`- Invoices: ${invoices.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
