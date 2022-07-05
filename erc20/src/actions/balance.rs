use crate::state::State;
use crate::action::{QueryResponseMsg::Balance, ActionResult};
use warp_wasm_utils::contract_utils::handler_result::HandlerResult::QueryResponse;

pub fn balance(state: State, target: String) -> ActionResult {
    Ok(QueryResponse(
        Balance {
            balance: *state.balances.get( & target).unwrap_or(&0),
            ticker: state.ticker,
            target
        }
    ))
}


