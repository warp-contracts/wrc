use crate::action::{Action, ActionResult};
use crate::actions::transfers::transfer;
use crate::actions::transfers::transfer_from;
use crate::actions::balance::balance_of;
use crate::actions::balance::total_supply;
use crate::actions::allowances::approve;
use crate::actions::allowances::allowance;
use crate::actions::evolve::evolve;
use crate::state::State;

pub async fn handle(current_state: State, action: Action) -> ActionResult {

    match action {
        Action::Transfer { to, amount } => transfer(current_state, to, amount),
        Action::TransferFrom { from, to, amount } => transfer_from(current_state, from, to, amount),
        Action::BalanceOf { target } => balance_of(current_state, target),
        Action::TotalSupply { } => total_supply(current_state),
        Action::Approve { spender, amount } => approve(current_state, spender, amount),
        Action::Allowance { owner, spender } => allowance(current_state, owner, spender),
        Action::Evolve { value } => evolve(current_state, value),
    }
}
