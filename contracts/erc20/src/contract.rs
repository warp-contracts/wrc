use crate::{
    action::{Action, WriteResponse, ViewResponse},
    actions::{
        allowances::{allowance, approve},
        balance::{balance_of, total_supply},
        evolve::evolve,
        transfers::{transfer, transfer_from},
    },
    state::State,
};
use warp_contracts::{
    js_imports::{log, Block, Contract, SmartWeave, Transaction},
    warp_contract,
};

#[warp_contract(write)]
pub async fn handle(current_state: State, action: Action) -> WriteResponse {
    //Example of accessing functions imported from js:
    log("log from contract");
    log(&("Transaction::id()".to_owned() + &Transaction::id()));
    log(&("Transaction::owner()".to_owned() + &Transaction::owner()));
    log(&("Transaction::target()".to_owned() + &Transaction::target()));

    log(&("Block::height()".to_owned() + &Block::height().to_string()));
    log(&("Block::indep_hash()".to_owned() + &Block::indep_hash()));
    log(&("Block::timestamp()".to_owned() + &Block::timestamp().to_string()));

    log(&("Contract::id()".to_owned() + &Contract::id()));
    log(&("Contract::owner()".to_owned() + &Contract::owner()));

    log(&("SmartWeave::caller()".to_owned() + &SmartWeave::caller()));

    match action {
        Action::Transfer { to, amount } => transfer(current_state, to, amount),
        Action::TransferFrom { from, to, amount } => transfer_from(current_state, from, to, amount),
        Action::Approve { spender, amount } => approve(current_state, spender, amount),
        Action::Evolve { value } => evolve(current_state, value),
        _ => WriteResponse::RuntimeError(format!("invalid action for write method: {:?}", action)),
    }
}

#[warp_contract(view)]
pub async fn view(current_state: &State, action: Action) -> ViewResponse {
    //Example of accessing functions imported from js:
    log("log from contract");
    log(&("Transaction::id()".to_owned() + &Transaction::id()));
    log(&("Transaction::owner()".to_owned() + &Transaction::owner()));
    log(&("Transaction::target()".to_owned() + &Transaction::target()));

    log(&("Block::height()".to_owned() + &Block::height().to_string()));
    log(&("Block::indep_hash()".to_owned() + &Block::indep_hash()));
    log(&("Block::timestamp()".to_owned() + &Block::timestamp().to_string()));

    log(&("Contract::id()".to_owned() + &Contract::id()));
    log(&("Contract::owner()".to_owned() + &Contract::owner()));

    log(&("SmartWeave::caller()".to_owned() + &SmartWeave::caller()));

    match action {
        Action::BalanceOf { target } => balance_of(current_state, target),
        Action::TotalSupply {} => total_supply(current_state),
        Action::Allowance { owner, spender } => allowance(current_state, owner, spender),
        _ => ViewResponse::RuntimeError(format!("invalid action for write method: {:?}", action)),
    }
}
