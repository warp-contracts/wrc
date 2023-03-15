use crate::{
    action::{QueryResponseMsg::Stake, ViewResponse, WriteResponse},
    erc20::{BalanceResult, View},
    error::ContractError::{
        self, StakingAmountMustBeHigherThanZero, WithdrawalAmountMustBeHigherThanZero,
    },
    state::State,
};
use serde::Serialize;
use warp_contracts::{
    foreign_call::{view_foreign_contract_state, write_foreign_contract},
    handler_result::{ViewResult, WriteResult},
    js_imports::{Contract, Transaction},
};

#[derive(Serialize)]
struct InputTransferFrom {
    function: String,
    from: String,
    to: String,
    amount: u64,
}

#[derive(Serialize)]
struct InputTransfer {
    function: String,
    to: String,
    amount: u64,
}

pub async fn stake(mut state: State, amount: u64) -> WriteResponse {
    if amount == 0 {
        return WriteResponse::ContractError(StakingAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let contract_id = Contract::id();
    let stakes = &mut state.stakes;
    let current_stake = *stakes.get(&caller).unwrap_or(&0);

    match write_foreign_contract::<_, ContractError>(
        &state.token,
        InputTransferFrom {
            function: "transferFrom".to_string(),
            from: caller.to_owned(),
            to: contract_id,
            amount,
        },
    )
    .await
    {
        WriteResult::Success(_) => {
            // Update caller balance
            stakes.insert(caller, current_stake + amount);
            WriteResponse::Success(state)
        }
        WriteResult::ContractError(e) => WriteResponse::ContractError(e),
        WriteResult::RuntimeError(e) => WriteResult::RuntimeError(e),
    }
}

pub async fn stake_all(state: State) -> WriteResponse {
    let caller = Transaction::owner();

    match view_foreign_contract_state::<BalanceResult, _, ContractError>(
        &state.token,
        View::BalanceOf { target: caller },
    )
    .await
    {
        ViewResult::Success(BalanceResult {
            target: _,
            ticker: _,
            balance,
        }) => stake(state, balance).await,
        ViewResult::ContractError(e) => WriteResponse::ContractError(e),
        ViewResult::RuntimeError(e) => WriteResponse::RuntimeError(e),
    }
    // match read_foreign_contract_state::<ERC20State>(&state.token.to_string()).await {
    //     Ok(erc20_state) => {
    //         let amount = *erc20_state.balances.get(&caller).unwrap_or(&0);
    //         stake(state, amount).await
    //     }
    //     Err(e) => WriteResponse::RuntimeError(e),
    // }
}

pub async fn re_stake(state: State) -> WriteResponse {
    let caller = Transaction::owner();
    let current_stake = *state.stakes.get(&caller).unwrap_or(&0);

    match withdraw(state, current_stake).await {
        WriteResult::Success(state) => stake_all(state).await,
        WriteResult::ContractError(e) => WriteResponse::ContractError(e),
        WriteResult::RuntimeError(e) => WriteResponse::RuntimeError(e),
    }
}

pub async fn withdraw(mut state: State, amount: u64) -> WriteResponse {
    if amount == 0 {
        return WriteResponse::ContractError(WithdrawalAmountMustBeHigherThanZero);
    }

    let caller = Transaction::owner();
    let stakes = &mut state.stakes;
    let current_stake = *stakes.get(&caller).unwrap_or(&0);

    // Send tokens
    match write_foreign_contract(
        &state.token,
        InputTransfer {
            function: "transfer".to_string(),
            to: caller.to_owned(),
            amount,
        },
    )
    .await
    {
        WriteResult::Success(_) => {
            // Update caller balance
            stakes.insert(caller, current_stake - amount);
            WriteResponse::Success(state)
        }
        WriteResult::ContractError(e) => WriteResult::ContractError(e),
        WriteResult::RuntimeError(e) => WriteResponse::RuntimeError(e),
    }
}

pub fn stake_of(state: &State, target: String) -> ViewResponse {
    ViewResponse::Success(Stake {
        stake: *state.stakes.get(&target).unwrap_or(&0),
    })
}
