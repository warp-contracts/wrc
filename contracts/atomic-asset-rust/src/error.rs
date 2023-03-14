use serde::Serialize;

#[derive(Serialize, Debug)]
pub enum ContractError {
    RuntimeError(String),
    CallerBalanceNotEnough(u64),
    CallerAllowanceNotEnough(u64),
    AllowanceHasToGtThenZero,
}
