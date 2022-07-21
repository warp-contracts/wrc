use serde::Serialize;

#[derive(Serialize)]
pub enum ContractError {
  FailedTokenTransfer(String),
  RuntimeError(String),
  StakingAmountMustBeHigherThanZero,
  WithdrawalAmountMustBeHigherThanZero,
  EvolveNotAllowed,
  OnlyOwnerCanEvolve
}
