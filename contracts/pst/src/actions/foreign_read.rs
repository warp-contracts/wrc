use crate::{action::WriteResponse, error::ContractError::IDontLikeThisContract, state::State};
use warp_contracts::{foreign_call::read_foreign_contract_state, js_imports::log};

pub async fn foreign_read(mut state: State, contract_tx_id: String) -> WriteResponse {
    if contract_tx_id == "bad_contract" {
        WriteResponse::ContractError(IDontLikeThisContract)
    } else {
        let foreign_contract_state: State = match read_foreign_contract_state(&contract_tx_id).await {
            Ok(v) => v,
            Err(e) => return WriteResponse::RuntimeError(format!("{:?}", e))
        };
        // Some dummy logic - just for the sake of the integration test
        if foreign_contract_state.ticker == "FOREIGN_PST" {
            log("Adding to tokens");
            for val in state.balances.values_mut() {
                *val += 1000;
            }
        }

        WriteResponse::Success(state)
    }
}
