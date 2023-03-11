use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum ContractError {
    RuntimeError(String),
    TransferAmountMustBeHigherThanZero,
    IDontLikeThisContract,
    CallerBalanceNotEnough(u64),
    OnlyOwnerCanEvolve,
    EvolveNotAllowed,
    WalletHasNoBalanceDefined(String),
}
