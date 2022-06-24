use serde::Serialize;

#[derive(Serialize)]
pub enum ContractError {
  FailedTokenTransfer(String),
  RuntimeError(String),
  TransferAmountMustBeHigherThanZero,
  EvolveNotAllowed,
  OnlyOwnerCanEvolve
}
