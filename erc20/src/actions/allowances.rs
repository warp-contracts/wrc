use crate::state::State;
use std::collections::HashMap;
use crate::contract_utils::handler_result::HandlerResult;
use crate::action::{QueryResponseMsg::Allowance, ActionResult};
use crate::contract_utils::handler_result::HandlerResult::QueryResponse;
use crate::contract_utils::js_imports::{Transaction};

pub fn allowance(state: State, owner: String, spender: String) -> ActionResult {
    Ok(QueryResponse(
        Allowance {
            ticker: state.ticker,
            allowance: _get_allowance(&state.allowances, &owner, &spender),
            owner,
            spender
        }
    ))
}

pub fn approve(mut state: State, spender: String, amount: u64) -> ActionResult {
    let caller = Transaction::owner();
    _set_allowance(&mut state.allowances, caller, spender, amount);
    Ok(HandlerResult::NewState(state))
}

// not sure if that's the convention in Rust (i.e. prefixing private functions with _)
// also - if that's a private function - should the "pub" modifier be removed?

// https://doc.rust-lang.org/reference/visibility-and-privacy.html
/*
A crate needs a global available "helper module" to itself, but it doesn't want to expose the helper
module as a public API. To accomplish this, the root of the crate's hierarchy would have a private
module which then internally has a "public API".
Because the entire crate is a descendant of the root, then the entire local crate can access this
private module through the second case.

+ https://doc.rust-lang.org/reference/visibility-and-privacy.html#pubin-path-pubcrate-pubsuper-and-pubself
 */
pub fn _set_allowance(allowances: &mut HashMap<String, HashMap<String, u64>>, owner: String, spender: String, amount: u64) {
    if amount > 0 {
        *allowances
            .entry(owner)
            .or_default()
            .entry(spender)
            .or_default() = amount;
    } else { //Prune state
        match allowances.get_mut(&owner) {
                Some(spender_allowances) => {
                    spender_allowances.remove(&spender);
                    if spender_allowances.is_empty() {
                        allowances.remove(&owner);
                    }
                }
                None => ()
            }
    }
}

pub fn _get_allowance(allowances: &HashMap<String, HashMap<String, u64>>, owner: &String, spender: &String) -> u64 {
    return *allowances
        .get(owner)
        .map_or(&0, |spenders| {
            spenders.get(spender).unwrap_or(&0)
        });
}
