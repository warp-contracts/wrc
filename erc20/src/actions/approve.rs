use crate::error::ContractError::{CallerBalanceNotEnough};
use crate::state::State;
use crate::action::ActionResult;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{log, SmartWeave, Transaction};

pub fn approve(mut state: State, spender: String, amount: u64) -> ActionResult {
    log(("caller ".to_owned() + &SmartWeave::caller()).as_str());
    log(("Transaction owner ".to_owned() + &Transaction::owner()).as_str());


    let caller = Transaction::owner();

    if amount > 0 {
        *state.allowances
            .entry(caller)
            .or_default()
            .entry(spender)
            .or_default() = amount;
    } else { //Prune state
        match state.allowances.get_mut(&caller) {
                Some(spenderAllowances) => {
                    spenderAllowances.remove(&spender);
                    if spenderAllowances.is_empty() {
                        state.allowances.remove(&caller);
                    }
                }
                None => ()
            }
    }

    Ok(HandlerResult::NewState(state))
}
