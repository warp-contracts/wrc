use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum ContractError {
    FailedTokenTransfer(String),
    CallerAllowanceNotEnough(u64),
    CallerBalanceNotEnough(u64),
    StakingAmountMustBeHigherThanZero,
    WithdrawalAmountMustBeHigherThanZero,
    EvolveNotAllowed,
    OnlyOwnerCanEvolve,
}
