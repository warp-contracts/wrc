use crate::{error::ContractError, state::State};
use serde::{Deserialize, Serialize};
use warp_contracts::handler_result::{ViewResult, WriteResult};

#[derive(Deserialize, core::fmt::Debug)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum Action {
    Transfer {
        qty: u64,
        target: String,
    },
    Balance {
        target: String,
    },
    Evolve {
        value: String,
    },
    #[serde(rename_all = "camelCase")]
    ForeignRead {
        contract_tx_id: String,
    },
    #[serde(rename_all = "camelCase")]
    ForeignWrite {
        contract_tx_id: String,
        qty: u64,
        target: String,
    },
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase", untagged)]
pub enum QueryResponseMsg {
    Balance {
        balance: u64,
        ticker: String,
        target: String,
    },
}

pub type ViewResponse = ViewResult<QueryResponseMsg, ContractError>;
pub type WriteResponse = WriteResult<State, ContractError>;
