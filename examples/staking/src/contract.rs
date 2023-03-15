use crate::{
    action::{Action, ViewResponse, WriteResponse},
    actions::{
        evolve::evolve,
        staking::{re_stake, stake, stake_all, stake_of, withdraw},
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
        Action::Stake { amount } => stake(current_state, amount).await,
        Action::StakeAll {} => stake_all(current_state).await,
        Action::ReStake {} => re_stake(current_state).await,
        Action::Withdraw { amount } => withdraw(current_state, amount).await,
        Action::Evolve { value } => evolve(current_state, value),
        _ => WriteResponse::RuntimeError(format!("invalid action for write method: {:?}", action)),
    }
}

#[warp_contract(view)]
pub async fn view(current_state: &State, action: Action) -> ViewResponse {
    match action {
        Action::StakeOf { target } => stake_of(current_state, target),
        _ => ViewResponse::RuntimeError(format!("invalid action for write method: {:?}", action)),
    }
}
