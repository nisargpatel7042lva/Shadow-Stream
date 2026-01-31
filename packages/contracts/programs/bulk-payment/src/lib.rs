use anchor_lang::prelude::*;

declare_id!("GzdWgJm7rkGsVFAFtGpMXBgrHawDrthT2PERFQ365WT6");

#[program]
pub mod bulk_payment {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.bump = ctx.bumps.vault;
        vault.total_paid = 0;
        vault.batch_count = 0;
        vault.is_active = true;
        
        emit!(VaultInitialized {
            vault: vault.key(),
            authority: vault.authority,
        });
        
        Ok(())
    }

    pub fn create_batch(
        ctx: Context<CreateBatch>,
        recipients: Vec<Recipient>,
        token_mint: Option<Pubkey>,
        batch_id: u64,
    ) -> Result<()> {
        require!(recipients.len() > 0 && recipients.len() <= 50, ErrorCode::InvalidRecipientCount);
        
        let batch = &mut ctx.accounts.batch;
        let vault = &mut ctx.accounts.vault;
        
        // Calculate total amount
        let total_amount: u64 = recipients.iter().map(|r| r.amount).sum();
        
        batch.vault = vault.key();
        batch.creator = ctx.accounts.creator.key();
        batch.batch_id = batch_id;
        batch.recipient_count = recipients.len() as u8;
        batch.total_amount = total_amount;
        batch.token_mint = token_mint;
        batch.status = BatchStatus::Pending;
        batch.created_at = Clock::get()?.unix_timestamp;
        batch.executed_at = None;
        batch.recipients = recipients;
        
        vault.batch_count += 1;
        
        emit!(BatchCreated {
            batch: batch.key(),
            vault: vault.key(),
            batch_id,
            recipient_count: batch.recipient_count,
            total_amount,
        });
        
        Ok(())
    }

    pub fn execute_batch(ctx: Context<ExecuteBatch>) -> Result<()> {
        let batch = &mut ctx.accounts.batch;
        
        require!(batch.status == BatchStatus::Pending, ErrorCode::InvalidBatchStatus);
        require!(
            batch.vault == ctx.accounts.vault.key(),
            ErrorCode::InvalidVault
        );
        
        // Check vault has sufficient balance
        let vault_balance = ctx.accounts.vault.to_account_info().lamports();
        require!(
            vault_balance >= batch.total_amount,
            ErrorCode::InsufficientFunds
        );
        
        batch.status = BatchStatus::Executing;
        
        // Execute transfers
        if batch.token_mint.is_some() {
            // SPL Token transfers
            execute_token_transfers(&ctx)?;
        } else {
            // SOL transfers
            execute_sol_transfers(&ctx)?;
        }
        
        batch.status = BatchStatus::Executed;
        batch.executed_at = Some(Clock::get()?.unix_timestamp);
        
        let vault = &mut ctx.accounts.vault;
        vault.total_paid += batch.total_amount;
        
        emit!(BatchExecuted {
            batch: batch.key(),
            total_amount: batch.total_amount,
            recipient_count: batch.recipient_count,
        });
        
        Ok(())
    }

    pub fn cancel_batch(ctx: Context<CancelBatch>) -> Result<()> {
        let batch = &mut ctx.accounts.batch;
        
        require!(batch.status == BatchStatus::Pending, ErrorCode::CannotCancelExecutedBatch);
        require!(
            batch.creator == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );
        
        batch.status = BatchStatus::Cancelled;
        
        emit!(BatchCancelled {
            batch: batch.key(),
        });
        
        Ok(())
    }
}

// Account Structures
#[account]
pub struct PaymentVault {
    pub authority: Pubkey,      // 32
    pub bump: u8,               // 1
    pub total_paid: u64,        // 8
    pub batch_count: u64,       // 8
    pub is_active: bool,        // 1
}                               // = 50 bytes

#[account]
pub struct PaymentBatch {
    pub vault: Pubkey,              // 32
    pub creator: Pubkey,            // 32
    pub batch_id: u64,              // 8
    pub recipient_count: u8,        // 1
    pub total_amount: u64,          // 8
    pub token_mint: Option<Pubkey>, // 33 (1 + 32)
    pub status: BatchStatus,        // 1
    pub created_at: i64,            // 8
    pub executed_at: Option<i64>,   // 9 (1 + 8)
    pub recipients: Vec<Recipient>, // 4 + (recipients * 72)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Recipient {
    pub address: Pubkey,    // 32
    pub amount: u64,        // 8
    pub memo: [u8; 32],     // 32
}                           // = 72 bytes per recipient

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BatchStatus {
    Pending,
    Executing,
    Executed,
    Cancelled,
}

// Context Structs
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 50,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, PaymentVault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(recipients: Vec<Recipient>, token_mint: Option<Pubkey>, batch_id: u64)]
pub struct CreateBatch<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 132 + (recipients.len() * 72),
        seeds = [b"batch", vault.key().as_ref(), &batch_id.to_le_bytes()],
        bump
    )]
    pub batch: Account<'info, PaymentBatch>,
    
    #[account(
        mut,
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, PaymentVault>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteBatch<'info> {
    #[account(
        mut,
        seeds = [b"batch", vault.key().as_ref(), &batch.batch_id.to_le_bytes()],
        bump,
    )]
    pub batch: Account<'info, PaymentBatch>,
    
    #[account(
        mut,
        seeds = [b"vault", batch.vault.as_ref()],
        bump = vault.bump,
        has_one = authority
    )]
    pub vault: Account<'info, PaymentVault>,
    
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
    // Token program for SPL transfers (optional)
    /// CHECK: Token program
    pub token_program: Option<AccountInfo<'info>>,
}

#[derive(Accounts)]
pub struct CancelBatch<'info> {
    #[account(
        mut,
        seeds = [b"batch", vault.key().as_ref(), &batch.batch_id.to_le_bytes()],
        bump,
    )]
    pub batch: Account<'info, PaymentBatch>,
    
    #[account(
        seeds = [b"vault", vault.authority.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, PaymentVault>,
    
    pub authority: Signer<'info>,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid recipient count (must be 1-50)")]
    InvalidRecipientCount,
    
    #[msg("Invalid batch status for this operation")]
    InvalidBatchStatus,
    
    #[msg("Invalid vault")]
    InvalidVault,
    
    #[msg("Cannot cancel executed batch")]
    CannotCancelExecutedBatch,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
}

// Events
#[event]
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub authority: Pubkey,
}

#[event]
pub struct BatchCreated {
    pub batch: Pubkey,
    pub vault: Pubkey,
    pub batch_id: u64,
    pub recipient_count: u8,
    pub total_amount: u64,
}

#[event]
pub struct BatchExecuted {
    pub batch: Pubkey,
    pub total_amount: u64,
    pub recipient_count: u8,
}

#[event]
pub struct BatchCancelled {
    pub batch: Pubkey,
}

// Helper functions
fn execute_sol_transfers(ctx: &Context<ExecuteBatch>) -> Result<()> {
    use anchor_lang::solana_program::program::invoke_signed;
    use anchor_lang::solana_program::system_instruction;
    use anchor_lang::solana_program::account_info::AccountInfo;
    
    let batch = &ctx.accounts.batch;
    let vault = &ctx.accounts.vault;
    
    // Recipient accounts should be passed as remaining_accounts
    let remaining_accounts = ctx.remaining_accounts;
    let mut account_iter = remaining_accounts.iter();
    
    for (idx, recipient) in batch.recipients.iter().enumerate() {
        // Get recipient account from remaining_accounts
        let recipient_account = account_iter.next().ok_or(ErrorCode::InsufficientFunds)?;
        
        // Verify the account matches the recipient address
        require!(
            recipient_account.key() == &recipient.address,
            ErrorCode::InvalidVault
        );
        
        // Create transfer instruction
        let transfer_ix = system_instruction::transfer(
            &vault.key(),
            &recipient.address,
            recipient.amount,
        );
        
        // Execute the transfer with vault's PDA signature
        invoke_signed(
            &transfer_ix,
            &[
                vault.to_account_info(),
                recipient_account.clone(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[
                b"vault",
                vault.authority.as_ref(),
                &[vault.bump],
            ]],
        )?;
    }
    
    Ok(())
}

fn execute_token_transfers(ctx: &Context<ExecuteBatch>) -> Result<()> {
    use anchor_spl::token::{self, Transfer};
    
    let batch = &ctx.accounts.batch;
    let vault = &ctx.accounts.vault;
    
    // For SPL token transfers:
    // remaining_accounts[0] = token_program
    // remaining_accounts[1] = vault_token_account  
    // remaining_accounts[2..] = recipient token accounts (one per recipient)
    
    let remaining_accounts = ctx.remaining_accounts;
    require!(
        remaining_accounts.len() >= 2 + batch.recipients.len(),
        ErrorCode::InsufficientFunds
    );
    
    let token_program_info = &remaining_accounts[0];
    let vault_token_account = &remaining_accounts[1];
    let mut recipient_accounts = remaining_accounts[2..].iter();
    
    for recipient in batch.recipients.iter() {
        let recipient_token_account = recipient_accounts.next()
            .ok_or(ErrorCode::InsufficientFunds)?;
        
        // Create CPI context for token transfer
        let cpi_program = token_program_info.clone();
        let cpi_accounts = token::Transfer {
            from: vault_token_account.clone(),
            to: recipient_token_account.clone(),
            authority: vault.to_account_info(),
        };
        
        let cpi_ctx = anchor_lang::context::CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            &[&[
                b"vault",
                vault.authority.as_ref(),
                &[vault.bump],
            ]],
        );
        
        token::transfer(cpi_ctx, recipient.amount)?;
    }
    
    Ok(())
}
