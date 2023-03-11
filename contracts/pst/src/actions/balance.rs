use crate::{
    action::{QueryResponseMsg, ViewResponse},
    error::ContractError::WalletHasNoBalanceDefined,
    state::State,
};

pub fn balance(state: &State, target: String) -> ViewResponse {
    if !state.balances.contains_key(&target) {
        return ViewResponse::ContractError(WalletHasNoBalanceDefined(target));
    }
    ViewResponse::Success(QueryResponseMsg::Balance {
        balance: *state.balances.get(&target).unwrap(),
        ticker: state.ticker.clone(),
        target,
    })
}
