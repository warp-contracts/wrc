use crate::action::{ActionResult, QueryResponseMsg::Balance, QueryResponseMsg::TotalSupply};
use crate::state::State;
use warp_wasm_utils::contract_utils::handler_result::HandlerResult::QueryResponse;

pub fn balance_of(state: State, target: String) -> ActionResult {
    Ok(QueryResponse(Balance {
        balance: *state.balances.get(&target).unwrap_or(&0),
        target,
    }))
}

pub fn total_supply(state: State) -> ActionResult {
    Ok(QueryResponse(TotalSupply {
        value: state.total_supply,
    }))
}
