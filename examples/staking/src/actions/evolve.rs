use crate::{action::WriteResponse, error::ContractError::*, state::State};
use warp_contracts::js_imports::Transaction;

pub fn evolve(mut state: State, value: String) -> WriteResponse {
    match state.can_evolve {
        Some(true) if state.owner == Transaction::owner() => {
            state.evolve = Option::from(value);
            WriteResponse::Success(state)
        }
        Some(_) => WriteResponse::ContractError(OnlyOwnerCanEvolve),
        None => WriteResponse::ContractError(EvolveNotAllowed),
    }
}
