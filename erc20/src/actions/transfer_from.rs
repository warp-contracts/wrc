use crate::error::ContractError::{CallerBalanceNotEnough, CallerAllowanceNotEnough, TransferAmountMustBeHigherThanZero};
use crate::state::State;
use crate::action::ActionResult;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{log, SmartWeave, Transaction};

pub fn transfer_from(mut state: State, from: String, to: String, amount: u64) -> ActionResult {
    if amount == 0 {
        return Err(TransferAmountMustBeHigherThanZero);
    }

    let caller = SmartWeave::caller();
    let balances = &mut state.balances;

    // Checking if from has enough funds
    let from_balance = *balances.get(&from).unwrap_or(&0);
    if from_balance < amount {
        return Err(CallerBalanceNotEnough(from_balance));
    }

    // Checking allowance
    let allowance = *state.allowances.get(&from)
                        .map_or(&0, |spenders| {
                            spenders.get(&caller).unwrap_or(&9)
                        });

    if allowance < amount {
       return Err(CallerAllowanceNotEnough(allowance));
    }

    // Update caller balance or prune state if the new value is 0
        if from_balance - amount == 0 {
            balances.remove(&from);
        } else  {
            balances.insert(from.to_owned(), from_balance - amount);
        }

    // Update target balance
    let to_balance = *balances.get(&to).unwrap_or(&0);
    balances.insert(to, to_balance + amount);

    // Update allowance
//     *state.allowances
//         .entry(from)
//         .or_default()
//         .entry(caller)
//         .or_default() = allowance - amount;


    if allowance - amount > 0 {
            *state.allowances
                .entry(from)
                .or_default()
                .entry(caller)
                .or_default() = allowance - amount;
        } else { //Prune state
            match state.allowances.get_mut(&from) {
                    Some(spenderAllowances) => {
                        spenderAllowances.remove(&caller);
                        if spenderAllowances.is_empty() {
                            state.allowances.remove(&from);
                        }
                    }
                    None => ()
                }
        }

    Ok(HandlerResult::NewState(state))
}




