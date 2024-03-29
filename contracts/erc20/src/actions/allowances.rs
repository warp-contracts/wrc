use crate::{
    action::{QueryResponseMsg::Allowance, ViewResponse, WriteResponse},
    state::State,
};
use std::collections::HashMap;
use warp_contracts::js_imports::Transaction;

pub fn allowance(state: &State, owner: String, spender: String) -> ViewResponse {
    ViewResponse::Success(Allowance {
        ticker: state.symbol.clone(),
        allowance: __get_allowance(&state.allowances, &owner, &spender),
        owner,
        spender,
    })
}

pub fn approve(mut state: State, spender: String, amount: u64) -> WriteResponse {
    let caller = Transaction::owner();
    __set_allowance(&mut state.allowances, caller, spender, amount);
    WriteResponse::Success(state)
}

//Following: https://users.rust-lang.org/t/use-of-pub-for-non-public-apis/40480
// Not a part of the contract API - used internally within the crate.
#[doc(hidden)]
pub fn __set_allowance(
    allowances: &mut HashMap<String, HashMap<String, u64>>,
    owner: String,
    spender: String,
    amount: u64,
) {
    if amount > 0 {
        *allowances
            .entry(owner)
            .or_default()
            .entry(spender)
            .or_default() = amount;
    } else {
        //Prune state
        match allowances.get_mut(&owner) {
            Some(spender_allowances) => {
                spender_allowances.remove(&spender);
                if spender_allowances.is_empty() {
                    allowances.remove(&owner);
                }
            }
            None => (),
        }
    }
}

//Following: https://users.rust-lang.org/t/use-of-pub-for-non-public-apis/40480
// Not a part of the contract API - used internally within the crate.
#[doc(hidden)]
pub fn __get_allowance(
    allowances: &HashMap<String, HashMap<String, u64>>,
    owner: &String,
    spender: &String,
) -> u64 {
    return *allowances
        .get(owner)
        .map_or(&0, |spenders| spenders.get(spender).unwrap_or(&0));
}
