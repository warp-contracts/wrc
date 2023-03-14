use crate::{
    action::{
        QueryResponseMsg::{Balance, Owner, TotalSupply},
        ViewResponse,
    },
    state::State,
};

pub fn balance_of(state: &State, target: String) -> ViewResponse {
    ViewResponse::Success(Balance {
        balance: *state.balances.get(&target).unwrap_or(&0),
        target,
    })
}

pub fn total_supply(state: &State) -> ViewResponse {
    ViewResponse::Success(TotalSupply {
        value: state.total_supply,
    })
}

pub fn owner(state: &State) -> ViewResponse {
    ViewResponse::Success(Owner { value: state.owner.clone() })
}
