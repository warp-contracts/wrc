use crate::action::{Action, ActionResult};
use crate::actions::allowances::{allowance, decrease_allowance};
use crate::actions::allowances::{approve, increase_allowance};
use crate::actions::balance::{balance_of, owner, total_supply};
use crate::actions::transfers::transfer;
use crate::actions::transfers::transfer_from;
use crate::state::State;

pub async fn handle(current_state: State, action: Action) -> ActionResult {
    match action {
        Action::Transfer { to, amount } => transfer(current_state, to, amount),
        Action::TransferFrom { from, to, amount } => transfer_from(current_state, from, to, amount),
        Action::BalanceOf { target } => balance_of(current_state, target),
        Action::TotalSupply {} => total_supply(current_state),
        Action::Approve { spender, amount } => approve(current_state, spender, amount),
        Action::Allowance { owner, spender } => allowance(current_state, owner, spender),
        Action::IncreaseAllowance {
            spender,
            amount_to_add,
        } => increase_allowance(current_state, spender, amount_to_add),
        Action::DecreaseAllowance {
            spender,
            amount_to_subtract,
        } => decrease_allowance(current_state, spender, amount_to_subtract),
        Action::Owner {} => owner(current_state)
    }
}
