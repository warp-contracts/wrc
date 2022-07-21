use serde::{Deserialize, Serialize};
use crate::error::ContractError::{WithdrawalAmountMustBeHigherThanZero, StakingAmountMustBeHigherThanZero, FailedTokenTransfer, RuntimeError};
use crate::state::State;
use crate::erc20::ERC20State;
use crate::contract_utils::handler_result::HandlerResult;
use crate::contract_utils::js_imports::{SmartWeave, Transaction, Contract};
use crate::action::{QueryResponseMsg::Stake, ActionResult};
use crate::contract_utils::handler_result::HandlerResult::QueryResponse;
use wasm_bindgen::JsValue;

#[derive(Serialize)]
struct InputTransferFrom {
    function: String,
    from: String,
    to: String,
    amount: u64
}

#[derive(Serialize)]
struct InputTransfer {
    function: String,
    to: String,
    amount: u64
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
        return Err(StakingAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let contract_id = Contract::id();
    let stakes = &mut state.stakes;
    let current_stake = *stakes.get(&caller).unwrap_or(&0);

    let result = SmartWeave::write(
        &state.token.to_string(),
        JsValue::from_serde(&InputTransferFrom {
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

pub async fn stake_all(state: State) -> ActionResult {
    let caller = Transaction::owner();

    let result = SmartWeave::read_contract_state(&state.token.to_string()).await;
    let erc20_state: ERC20State = result.into_serde().unwrap();
    let amount = *erc20_state.balances.get(&caller).unwrap_or(&0);

    stake(state, amount).await
}

pub async fn re_stake(state: State) -> ActionResult {
    let caller = Transaction::owner();
    let current_stake = *state.stakes.get( & caller).unwrap_or(&0);

    match withdraw(state, current_stake).await {
        Err(e) => return Err(e),
        Ok(result) => match result {
            HandlerResult::NewState(new_state) => stake_all(new_state).await,
            _ => Err(RuntimeError("Unexpected result from staking".to_string()))
        }
    }
}

pub async fn withdraw(mut state: State, amount: u64) -> ActionResult {
    if amount == 0 {
        return Err(WithdrawalAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let stakes = &mut state.stakes;
    let current_stake = *stakes.get(&caller).unwrap_or(&0);

    // Send tokens
    let result = SmartWeave::write(
        &state.token.to_string(),
        JsValue::from_serde(&InputTransfer {
            function: "transfer".to_string(),
            to: caller.to_owned(),
            amount
        }).unwrap(),
    ).await;

    let result: Result = result.into_serde().unwrap();

    if result.result_type != "ok" {
        return Err(FailedTokenTransfer(result.error_message));
    }

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
