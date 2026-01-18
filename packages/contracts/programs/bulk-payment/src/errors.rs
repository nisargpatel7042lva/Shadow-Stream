use anchor_lang::prelude::*;

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
