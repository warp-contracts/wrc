use crate::error::ContractError::{CallerBalanceNotEnough, CallerAllowanceNotEnough};
use crate::actions::allowances::{_set_allowance, _get_allowance};
use crate::state::State;
use crate::action::ActionResult;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{SmartWeave, Transaction};

pub fn transfer(state: State, to: String, amount: u64) -> ActionResult {
    let caller = SmartWeave::caller();
    return _transfer(state, caller, to, amount);
}

pub fn transfer_from(mut state: State, from: String, to: String, amount: u64) -> ActionResult {
    let caller = SmartWeave::caller();

    //Checking allowance
    let allowance = _get_allowance(&state.allowances, &from, &caller);

    if allowance < amount {
       return Err(CallerAllowanceNotEnough(allowance));
    }

    _set_allowance(&mut state.allowances, from.to_owned(), caller, allowance - amount);

    return _transfer(state, from, to, amount);
}

fn _transfer(mut state: State, from: String, to: String, amount: u64) -> ActionResult {
    // Checking if caller has enough funds
    let balances = &mut state.balances;
    let from_balance = *balances.get(&from).unwrap_or(&0);
    if from_balance < amount {
        return Err(CallerBalanceNotEnough(from_balance));
    }

    // Update caller balance or prune state if the new value is 0
    if from_balance - amount == 0 {
        balances.remove(&from);
    } else  {
        balances.insert(from, from_balance - amount);
    }

    // Update target balance
    let to_balance = *balances.get(&to).unwrap_or(&0);
    balances.insert(to, to_balance + amount);

    Ok(HandlerResult::NewState(state))
}
