use crate::error::ContractError::{CallerBalanceNotEnough, ApprovedAmountMustBeHigherThanZero};
use crate::state::State;
use crate::action::ActionResult;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{log, SmartWeave, Transaction};

pub fn approve(mut state: State, spender: String, amount: u64) -> ActionResult {
    log(("caller ".to_owned() + &SmartWeave::caller()).as_str());
    log(("Transaction owner ".to_owned() + &Transaction::owner()).as_str());

    if amount == 0 {
        return Err(ApprovedAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let balances = &mut state.balances;

    // Checking if caller has enough funds
    let caller_balance = *balances.get(&caller).unwrap_or(&0);
    if caller_balance < amount {
        return Err(CallerBalanceNotEnough(caller_balance));
    }

    *state.allowances
                    .entry(caller)
                    .or_default()
                    .entry(spender)
                    .or_default() = amount;

    Ok(HandlerResult::NewState(state))
}
