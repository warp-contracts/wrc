use crate::state::State;
use crate::action::{QueryResponseMsg::Balance, ActionResult};
use crate::contract_utils::handler_result::HandlerResult::QueryResponse;

// maybe we could stick to the original naming - `balanceOf`

pub fn balance(state: State, target: String) -> ActionResult {
    Ok(QueryResponse(
        Balance {
            balance: *state.balances.get( & target).unwrap_or(&0),
            // are we sure we need ticker and target here? seems like pst legacy not included in the standard
            ticker: state.ticker,
            target
        }
    ))
}


