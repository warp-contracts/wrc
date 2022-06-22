use serde::{Deserialize, Serialize};
use crate::error::ContractError::{TransferAmountMustBeHigherThanZero, FailedTokenTransfer};
use crate::state::State;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{log, SmartWeave, Transaction, Contract};
use crate::contract_utils::foreign_call::write_foreign_contract;
use crate::action::{QueryResponseMsg::Stake, ActionResult};
use crate::contract_utils::handler_result::HandlerResult::QueryResponse;
use wasm_bindgen::JsValue;

#[derive(Serialize)]
struct Input {
    function: String,
    from: String,
    to: String,
    amount: u64,
}

#[derive(Debug, Deserialize)]
struct Result {
    #[serde(rename = "type")]
    result_type: String,
    #[serde(rename = "errorMessage")]
    #[serde(default)]
    error_message: String
}

pub async fn stake(mut state: State, amount: u64) -> ActionResult {
    if amount == 0 {
        return Err(TransferAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let contract_id = Contract::id();
    let stakes = &mut state.stakes;
    let current_stake = *stakes.get(&caller).unwrap_or(&0);

    let result = SmartWeave::write(
        &state.token.to_string(),
        JsValue::from_serde(&Input {
            function: "transferFrom".to_string(),
            from: caller.to_owned(),
            to: contract_id,
            amount
        })
        .unwrap(),
    )
    .await;

    let result: Result = result.into_serde().unwrap();

    if result.result_type != "ok" {
        return Err(FailedTokenTransfer(result.error_message));
    }

    // Update caller balance
    stakes.insert(caller, current_stake + amount);

    Ok(HandlerResult::NewState(state))
}

pub fn withdraw(mut state: State, amount: u64) -> ActionResult {
    if amount == 0 {
        return Err(TransferAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let stakes = &mut state.stakes;
    let current_stake = *stakes.get(&caller).unwrap_or(&0);

    // Update caller balance
    stakes.insert(caller, current_stake - amount);

    Ok(HandlerResult::NewState(state))
}

pub fn stake_of(state: State, target: String) -> ActionResult {
    Ok(QueryResponse(
        Stake {
            stake: *state.stakes.get( & target).unwrap_or(&0)
        }
    ))
}
