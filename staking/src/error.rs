use serde::Serialize;

#[derive(Serialize)]
pub enum ContractError {
  FailedTokenTransfer,
  RuntimeError(String),
  TransferAmountMustBeHigherThanZero,
  IDontLikeThisContract,
  CallerBalanceNotEnough(u64),
  CallerAllowanceNotEnough(u64),
  OnlyOwnerCanEvolve,
  EvolveNotAllowed,
  WalletHasNoBalanceDefined(String),
  ApprovedAmountMustBeHigherThanZero
}
