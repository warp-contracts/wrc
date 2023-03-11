use crate::{action::WriteResponse, state::State};
use serde::Serialize;
use warp_contracts::{foreign_call::write_foreign_contract, handler_result::WriteResult};

#[derive(Serialize)]
struct Input {
    function: String,
    qty: u64,
    target: String,
}

pub async fn foreign_write(
    state: State,
    contract_tx_id: String,
    qty: u64,
    target: String,
) -> WriteResponse {
    match write_foreign_contract(
        &contract_tx_id,
        Input {
            function: "transfer".to_string(),
            qty,
            target,
        },
    )
    .await
    {
        WriteResult::Success(v) => v,
        WriteResult::ContractError(e) => return WriteResponse::ContractError(e),
        WriteResult::RuntimeError(e) => return WriteResponse::RuntimeError(format!("{:?}", e)),
    };

    WriteResponse::Success(state)
}
