import { Keypair, PublicKey } from '@solana/web3.js'
import { CustomPrivacyService } from '../custom-zk'
import { MerkleTree } from '../merkle-proof'

describe('CustomPrivacyService', () => {
  let service: CustomPrivacyService
  let sender: Keypair
  let recipient1: Keypair
  let recipient2: Keypair

  beforeEach(() => {
    service = new CustomPrivacyService()
    sender = Keypair.generate()
    recipient1 = Keypair.generate()
    recipient2 = Keypair.generate()
  })

  describe('encryptPaymentData', () => {
    it('should encrypt payment data for multiple recipients', async () => {
      const recipients = [
        {
          publicKey: recipient1.publicKey,
          amount: 1000000,
          memo: 'Payment 1',
        },
        {
          publicKey: recipient2.publicKey,
          amount: 2000000,
          memo: 'Payment 2',
        },
      ]

      const encrypted = await service.encryptPaymentData({
        recipients,
        senderKeypair: sender,
      })

      expect(encrypted.payments).toHaveLength(2)
      expect(encrypted.payments[0].recipientPublicKey).toBe(
        recipient1.publicKey.toBase58()
      )
      expect(encrypted.payments[0].encryptedData).toBeTruthy()
      expect(encrypted.payments[0].nonce).toBeTruthy()
      expect(encrypted.payments[0].commitment).toBeTruthy()
      expect(encrypted.merkleRoot).toBeTruthy()
    })

    it('should generate unique commitments for each payment', async () => {
      const recipients = [
        {
          publicKey: recipient1.publicKey,
          amount: 1000000,
        },
        {
          publicKey: recipient2.publicKey,
          amount: 1000000, // Same amount
        },
      ]

      const encrypted = await service.encryptPaymentData({
        recipients,
        senderKeypair: sender,
      })

      // Commitments should be different even for same amount
      expect(encrypted.payments[0].commitment).not.toBe(
        encrypted.payments[1].commitment
      )
    })
  })

  describe('decryptPayment', () => {
    it('should decrypt payment data correctly', async () => {
      const recipients = [
        {
          publicKey: recipient1.publicKey,
          amount: 1000000,
          memo: 'Test payment',
        },
      ]

      const encrypted = await service.encryptPaymentData({
        recipients,
        senderKeypair: sender,
      })

      const decrypted = await service.decryptPayment({
        encryptedData: encrypted.payments[0].encryptedData,
        nonce: encrypted.payments[0].nonce,
        senderPublicKey: sender.publicKey,
        recipientKeypair: recipient1,
      })

      expect(decrypted.amount).toBe(1000000)
      expect(decrypted.memo).toBe('Test payment')
      expect(decrypted.timestamp).toBeTruthy()
    })

    it('should fail to decrypt with wrong keypair', async () => {
      const recipients = [
        {
          publicKey: recipient1.publicKey,
          amount: 1000000,
        },
      ]

      const encrypted = await service.encryptPaymentData({
        recipients,
        senderKeypair: sender,
      })

      await expect(
        service.decryptPayment({
          encryptedData: encrypted.payments[0].encryptedData,
          nonce: encrypted.payments[0].nonce,
          senderPublicKey: sender.publicKey,
          recipientKeypair: recipient2, // Wrong recipient
        })
      ).rejects.toThrow()
    })
  })

  describe('Merkle proof generation', () => {
    it('should generate valid Merkle proof', () => {
      const payments = [
        { commitment: 'commitment1' },
        { commitment: 'commitment2' },
        { commitment: 'commitment3' },
      ]

      const { proof, root } = service.generateMerkleProof(payments, 0)

      expect(proof).toBeTruthy()
      expect(root).toBeTruthy()
      expect(Array.isArray(proof)).toBe(true)
    })

    it('should verify Merkle proof correctly', () => {
      const payments = [
        { commitment: 'commitment1' },
        { commitment: 'commitment2' },
        { commitment: 'commitment3' },
      ]

      const { proof, root } = service.generateMerkleProof(payments, 0)
      const isValid = service.verifyMerkleProof(
        'commitment1',
        proof,
        root
      )

      expect(isValid).toBe(true)
    })

    it('should reject invalid Merkle proof', () => {
      const payments = [
        { commitment: 'commitment1' },
        { commitment: 'commitment2' },
      ]

      const { proof, root } = service.generateMerkleProof(payments, 0)
      const isValid = service.verifyMerkleProof(
        'wrong_commitment',
        proof,
        root
      )

      expect(isValid).toBe(false)
    })
  })
})

describe('MerkleTree', () => {
  it('should build tree correctly', () => {
    const leaves = ['leaf1', 'leaf2', 'leaf3', 'leaf4']
    const tree = new MerkleTree(leaves)

    expect(tree.getRoot()).toBeTruthy()
  })

  it('should generate proof for single leaf', () => {
    const leaves = ['leaf1']
    const tree = new MerkleTree(leaves)

    expect(tree.getRoot()).toBe('leaf1')
    expect(tree.getProof(0)).toEqual([])
  })

  it('should verify proof correctly', () => {
    const leaves = ['leaf1', 'leaf2', 'leaf3', 'leaf4']
    const tree = new MerkleTree(leaves)
    const root = tree.getRoot()
    const proof = tree.getProof(0)

    expect(tree.verifyProof('leaf1', proof, root)).toBe(true)
    expect(tree.verifyProof('leaf2', proof, root)).toBe(false)
  })
})
