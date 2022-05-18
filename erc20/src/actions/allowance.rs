use crate::state::State;
use crate::action::{QueryResponseMsg::Allowance, ActionResult};
use crate::contract_utils::handler_result::HandlerResult::QueryResponse;

pub fn allowance(state: State, owner: String, spender: String) -> ActionResult {
    let allowance = *state
        .allowances
        .get(&owner)
        .map_or(&0, |spenders| {
            spenders.get(&spender).unwrap_or(&0)
        });

    Ok(QueryResponse(
        Allowance {
            ticker: state.ticker,
            owner: owner,
            spender: spender,
            allowance: allowance,
        }
    ))

}
