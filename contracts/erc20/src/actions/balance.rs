use crate::{
    action::{
        QueryResponseMsg::{Balance, TotalSupply},
        ViewResponse,
    },
    state::State,
};

pub fn balance_of(state: &State, target: String) -> ViewResponse {
    ViewResponse::Success(Balance {
        balance: *state.balances.get(&target).unwrap_or(&0),
        ticker: state.symbol.clone(),
        target,
    })
}

pub fn total_supply(state: &State) -> ViewResponse {
    ViewResponse::Success(TotalSupply {
        value: state.total_supply,
    })
}
