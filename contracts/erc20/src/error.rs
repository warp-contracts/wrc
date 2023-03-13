use serde::Serialize;

#[derive(Serialize, Debug)]
pub enum ContractError {
    CallerBalanceNotEnough(u64),
    CallerAllowanceNotEnough(u64),
    OnlyOwnerCanEvolve,
    EvolveNotAllowed,
}
