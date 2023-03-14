use crate::{
    action::WriteResponse,
    actions::allowances::{__get_allowance, __set_allowance},
    error::ContractError::{CallerAllowanceNotEnough, CallerBalanceNotEnough},
    state::State,
};
use warp_contracts::js_imports::SmartWeave;

pub fn transfer(state: State, to: String, amount: u64) -> WriteResponse {
    let caller = SmartWeave::caller();

    return _transfer(state, caller, to, amount);
}

pub fn transfer_from(mut state: State, from: String, to: String, amount: u64) -> WriteResponse {
    let caller = SmartWeave::caller();

    //Checking allowance
    let allowance = __get_allowance(&state.allowances, &from, &caller);

    if allowance < amount {
        return WriteResponse::ContractError(CallerAllowanceNotEnough(allowance));
    }

    __set_allowance(
        &mut state.allowances,
        from.to_owned(),
        caller,
        allowance - amount,
    );

    return _transfer(state, from, to, amount);
}

pub fn _transfer(mut state: State, from: String, to: String, amount: u64) -> WriteResponse {
    // Checking if caller has enough funds
    let balances = &mut state.balances;
    let from_balance = *balances.get(&from).unwrap_or(&0);

    if from_balance < amount {
        return WriteResponse::ContractError(CallerBalanceNotEnough(from_balance));
    }

    // Update caller balance or prune state if the new value is 0
    if from_balance - amount == 0 {
        balances.remove(&from);
    } else {
        balances.insert(from.clone(), from_balance - amount);
    }

    // Update target balance
    *balances.entry(to.clone()).or_insert(0) += amount;

    // Update ownership if necessary
    _claim_ownership(&mut state, from, to);

    WriteResponse::Success(state)
}

fn _claim_ownership(state: &mut State, from: String, to: String) {
    let from_balance_updated = *state.balances.get(&*from).unwrap_or(&0);
    let to_balance_updated = *state.balances.get(&*to).unwrap_or(&0);

    if state.owner.is_some() && (from_balance_updated != state.total_supply) {
        state.owner = None;
    }

    if to_balance_updated == state.total_supply {
        state.owner = Option::from(to);
    }
}
