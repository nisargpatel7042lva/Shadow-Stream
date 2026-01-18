import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BulkPayment } from "../target/types/bulk_payment";
import { expect } from "chai";
import { 
  Keypair, 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";

describe("bulk-payment", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BulkPayment as Program<BulkPayment>;
  
  let authority: Keypair;
  let vaultPda: PublicKey;
  let vaultBump: number;
  
  beforeEach(async () => {
    // Create a new authority for each test
    authority = Keypair.generate();
    
    // Airdrop SOL to authority
    const signature = await provider.connection.requestAirdrop(
      authority.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
    
    // Derive vault PDA
    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), authority.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("initialize_vault", () => {
    it("Initializes a vault successfully", async () => {
      const tx = await program.methods
        .initializeVault()
        .accounts({
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const vaultAccount = await program.account.paymentVault.fetch(vaultPda);
      
      expect(vaultAccount.authority.toString()).to.equal(authority.publicKey.toString());
      expect(vaultAccount.bump).to.equal(vaultBump);
      expect(vaultAccount.totalPaid.toNumber()).to.equal(0);
      expect(vaultAccount.batchCount.toNumber()).to.equal(0);
      expect(vaultAccount.isActive).to.be.true;
    });

    it("Fails if vault already initialized", async () => {
      // Initialize first time
      await program.methods
        .initializeVault()
        .accounts({
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Try to initialize again - should fail
      try {
        await program.methods
          .initializeVault()
          .accounts({
            vault: vaultPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("create_batch", () => {
    beforeEach(async () => {
      // Initialize vault first
      await program.methods
        .initializeVault()
        .accounts({
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    });

    it("Creates a batch with single recipient", async () => {
      const recipient = Keypair.generate();
      const batchId = new anchor.BN(1);
      const amount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      
      const recipients = [{
        address: recipient.publicKey,
        amount: amount,
        memo: Array.from(Buffer.alloc(32)),
      }];

      const [batchPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("batch"),
          vaultPda.toBuffer(),
          batchId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const tx = await program.methods
        .createBatch(recipients, null, batchId)
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          creator: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const batchAccount = await program.account.paymentBatch.fetch(batchPda);
      
      expect(batchAccount.vault.toString()).to.equal(vaultPda.toString());
      expect(batchAccount.creator.toString()).to.equal(authority.publicKey.toString());
      expect(batchAccount.batchId.toString()).to.equal(batchId.toString());
      expect(batchAccount.recipientCount).to.equal(1);
      expect(batchAccount.totalAmount.toString()).to.equal(amount.toString());
      expect(batchAccount.status.pending).to.exist;
    });

    it("Creates a batch with multiple recipients", async () => {
      const recipients = Array.from({ length: 5 }, (_, i) => ({
        address: Keypair.generate().publicKey,
        amount: new anchor.BN((i + 1) * LAMPORTS_PER_SOL),
        memo: Array.from(Buffer.alloc(32)),
      }));
      
      const batchId = new anchor.BN(2);
      const totalAmount = recipients.reduce(
        (sum, r) => sum + r.amount.toNumber(),
        0
      );

      const [batchPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("batch"),
          vaultPda.toBuffer(),
          batchId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .createBatch(recipients, null, batchId)
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          creator: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const batchAccount = await program.account.paymentBatch.fetch(batchPda);
      
      expect(batchAccount.recipientCount).to.equal(5);
      expect(batchAccount.totalAmount.toNumber()).to.equal(totalAmount);
    });

    it("Fails with zero recipients", async () => {
      const batchId = new anchor.BN(3);

      try {
        await program.methods
          .createBatch([], null, batchId)
          .accounts({
            batch: PublicKey.findProgramAddressSync(
              [
                Buffer.from("batch"),
                vaultPda.toBuffer(),
                batchId.toArrayLike(Buffer, "le", 8),
              ],
              program.programId
            )[0],
            vault: vaultPda,
            creator: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err.toString()).to.include("InvalidRecipientCount");
      }
    });

    it("Fails with more than 50 recipients", async () => {
      const recipients = Array.from({ length: 51 }, () => ({
        address: Keypair.generate().publicKey,
        amount: new anchor.BN(LAMPORTS_PER_SOL),
        memo: Array.from(Buffer.alloc(32)),
      }));
      
      const batchId = new anchor.BN(4);

      try {
        await program.methods
          .createBatch(recipients, null, batchId)
          .accounts({
            batch: PublicKey.findProgramAddressSync(
              [
                Buffer.from("batch"),
                vaultPda.toBuffer(),
                batchId.toArrayLike(Buffer, "le", 8),
              ],
              program.programId
            )[0],
            vault: vaultPda,
            creator: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err.toString()).to.include("InvalidRecipientCount");
      }
    });
  });

  describe("execute_batch", () => {
    let batchPda: PublicKey;
    let batchId: anchor.BN;
    let recipients: Keypair[];
    let recipientAmounts: anchor.BN[];

    beforeEach(async () => {
      // Initialize vault
      await program.methods
        .initializeVault()
        .accounts({
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Fund vault with SOL
      const fundTx = await provider.connection.requestAirdrop(
        vaultPda,
        100 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(fundTx);

      // Create batch
      recipients = [Keypair.generate(), Keypair.generate()];
      recipientAmounts = [
        new anchor.BN(5 * LAMPORTS_PER_SOL),
        new anchor.BN(10 * LAMPORTS_PER_SOL),
      ];
      
      batchId = new anchor.BN(1);
      [batchPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("batch"),
          vaultPda.toBuffer(),
          batchId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const recipientsData = recipients.map((r, i) => ({
        address: r.publicKey,
        amount: recipientAmounts[i],
        memo: Array.from(Buffer.alloc(32)),
      }));

      await program.methods
        .createBatch(recipientsData, null, batchId)
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          creator: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    });

    it("Executes a batch successfully", async () => {
      // Get initial balances
      const initialBalances = await Promise.all(
        recipients.map(r => provider.connection.getBalance(r.publicKey))
      );

      // Execute batch
      // Note: In production, recipient accounts need to be passed as remaining_accounts
      const remainingAccounts = recipients.map(r => ({
        pubkey: r.publicKey,
        isSigner: false,
        isWritable: true,
      }));

      await program.methods
        .executeBatch()
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(remainingAccounts)
        .signers([authority])
        .rpc();

      // Verify batch status
      const batchAccount = await program.account.paymentBatch.fetch(batchPda);
      expect(batchAccount.status.executed).to.exist;
      expect(batchAccount.executedAt).to.not.be.null;

      // Verify vault stats
      const vaultAccount = await program.account.paymentVault.fetch(vaultPda);
      const expectedTotal = recipientAmounts.reduce(
        (sum, amt) => sum + amt.toNumber(),
        0
      );
      expect(vaultAccount.totalPaid.toNumber()).to.equal(expectedTotal);

      // Verify recipient balances increased
      const finalBalances = await Promise.all(
        recipients.map(r => provider.connection.getBalance(r.publicKey))
      );
      
      recipients.forEach((_, i) => {
        expect(finalBalances[i] - initialBalances[i]).to.equal(
          recipientAmounts[i].toNumber()
        );
      });
    });

    it("Fails if batch is not pending", async () => {
      // Execute batch first time
      const remainingAccounts = recipients.map(r => ({
        pubkey: r.publicKey,
        isSigner: false,
        isWritable: true,
      }));

      await program.methods
        .executeBatch()
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(remainingAccounts)
        .signers([authority])
        .rpc();

      // Try to execute again - should fail
      try {
        await program.methods
          .executeBatch()
          .accounts({
            batch: batchPda,
            vault: vaultPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .remainingAccounts(remainingAccounts)
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err.toString()).to.include("InvalidBatchStatus");
      }
    });

    it("Fails if vault has insufficient funds", async () => {
      // Create batch with amount larger than vault balance
      const largeBatchId = new anchor.BN(2);
      const [largeBatchPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("batch"),
          vaultPda.toBuffer(),
          largeBatchId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const largeRecipients = [{
        address: Keypair.generate().publicKey,
        amount: new anchor.BN(200 * LAMPORTS_PER_SOL), // More than vault has
        memo: Array.from(Buffer.alloc(32)),
      }];

      await program.methods
        .createBatch(largeRecipients, null, largeBatchId)
        .accounts({
          batch: largeBatchPda,
          vault: vaultPda,
          creator: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Try to execute - should fail
      try {
        await program.methods
          .executeBatch()
          .accounts({
            batch: largeBatchPda,
            vault: vaultPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .remainingAccounts(largeRecipients.map(r => ({
            pubkey: r.address,
            isSigner: false,
            isWritable: true,
          })))
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err.toString()).to.include("InsufficientFunds");
      }
    });
  });

  describe("cancel_batch", () => {
    let batchPda: PublicKey;
    let batchId: anchor.BN;

    beforeEach(async () => {
      // Initialize vault
      await program.methods
        .initializeVault()
        .accounts({
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Create batch
      batchId = new anchor.BN(1);
      [batchPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("batch"),
          vaultPda.toBuffer(),
          batchId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const recipients = [{
        address: Keypair.generate().publicKey,
        amount: new anchor.BN(LAMPORTS_PER_SOL),
        memo: Array.from(Buffer.alloc(32)),
      }];

      await program.methods
        .createBatch(recipients, null, batchId)
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          creator: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
    });

    it("Cancels a pending batch", async () => {
      await program.methods
        .cancelBatch()
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const batchAccount = await program.account.paymentBatch.fetch(batchPda);
      expect(batchAccount.status.cancelled).to.exist;
    });

    it("Fails if batch is already executed", async () => {
      // Execute batch first
      const recipients = [Keypair.generate()];
      const remainingAccounts = recipients.map(r => ({
        pubkey: r.publicKey,
        isSigner: false,
        isWritable: true,
      }));

      // Fund vault first
      await provider.connection.requestAirdrop(
        vaultPda,
        10 * LAMPORTS_PER_SOL
      );

      await program.methods
        .executeBatch()
        .accounts({
          batch: batchPda,
          vault: vaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(remainingAccounts)
        .signers([authority])
        .rpc();

      // Try to cancel - should fail
      try {
        await program.methods
          .cancelBatch()
          .accounts({
            batch: batchPda,
            vault: vaultPda,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err.toString()).to.include("CannotCancelExecutedBatch");
      }
    });

    it("Fails if not called by creator", async () => {
      const otherAuthority = Keypair.generate();

      try {
        await program.methods
          .cancelBatch()
          .accounts({
            batch: batchPda,
            vault: vaultPda,
            authority: otherAuthority.publicKey,
          })
          .signers([otherAuthority])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err.toString()).to.include("Unauthorized");
      }
    });
  });
});
