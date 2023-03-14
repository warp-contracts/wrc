use warp_contracts::warp_contract;

use crate::{
    action::{Action, WriteResponse, ViewResponse},
    actions::{
        allowances::{allowance, approve, decrease_allowance, increase_allowance},
        balance::{balance_of, owner, total_supply},
        transfers::{transfer, transfer_from},
    },
    state::State,
};

#[warp_contract(write)]
pub async fn handle(current_state: State, action: Action) -> WriteResponse {
    match action {
        Action::Transfer { to, amount } => transfer(current_state, to, amount),
        Action::TransferFrom { from, to, amount } => transfer_from(current_state, from, to, amount),
        Action::Approve { spender, amount } => approve(current_state, spender, amount),
        Action::IncreaseAllowance {
            spender,
            amount_to_add,
        } => increase_allowance(current_state, spender, amount_to_add),
        Action::DecreaseAllowance {
            spender,
            amount_to_subtract,
        } => decrease_allowance(current_state, spender, amount_to_subtract),
        _ => WriteResponse::RuntimeError(format!("invalid action for write method: {:?}", action)),

    }
}

#[warp_contract(view)]
pub async fn view(current_state: &State, action: Action) -> ViewResponse {
    match action {
        Action::BalanceOf { target } => balance_of(current_state, target),
        Action::TotalSupply {} => total_supply(current_state),
        Action::Allowance { owner, spender } => allowance(current_state, owner, spender),
        Action::Owner {} => owner(current_state),
        _ => ViewResponse::RuntimeError(format!("invalid action for view method: {:?}", action)),
    }
}
