use serde::Serialize;

#[derive(Serialize)]
pub enum ContractError {
  RuntimeError(String),
  TransferAmountMustBeHigherThanZero,
  IDontLikeThisContract,
  CallerBalanceNotEnough(u64),
  CallerAllowanceNotEnough(u64),
  OnlyOwnerCanEvolve,
  EvolveNotAllowed,
  ApprovedAmountMustBeHigherThanZero
}
