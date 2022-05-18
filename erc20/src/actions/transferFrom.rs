use crate::error::ContractError::{CallerBalanceNotEnough, CallerAllowanceNotEnough, TransferAmountMustBeHigherThanZero};
use crate::state::State;
use crate::action::ActionResult;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{log, SmartWeave, Transaction};

pub fn transferFrom(mut state: State, from: String, to: String, amount: u64) -> ActionResult {
    log(("caller ".to_owned() + &SmartWeave::caller()).as_str());
    log(("Transaction owner ".to_owned() + &Transaction::owner()).as_str());

    if amount == 0 {
        return Err(TransferAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let balances = &mut state.balances;

    // Checking if from has enough funds
    let from_balance = *balances.get(&from).unwrap_or(&0);
    if from_balance < amount {
        return Err(CallerBalanceNotEnough(from_balance));
    }

    // Checking allowance
    let allowance = *state.allowances.get(&from)
                        .map_or(&0, |spenders| {
                            spenders.get(&caller).unwrap_or(&0)
                        });

    if allowance < amount {
       return Err(CallerAllowanceNotEnough(allowance));
    }

    // Update balances
    balances.insert(from.to_owned(), from_balance - amount);
    let toBalance = *balances.get(&to).unwrap_or(&0);
    balances.insert(to, toBalance + amount);

    *state.allowances
        .entry(from)
        .or_default()
        .entry(caller)
        .or_default() = allowance - amount;

    Ok(HandlerResult::NewState(state))
}
