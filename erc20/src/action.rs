use serde::{Deserialize, Serialize};

use crate::contract_utils::handler_result::HandlerResult;
use crate::error::ContractError;
use crate::state::State;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum Action {
    Transfer {
        qty: u64,
        target: String,
    },
    TransferFrom {
        from: String,
        to: String,
        amount: u64
    },
    Balance {
        target: String
    },
    Approve {
        spender: String,
        amount: u64,
    },
    Allowance {
        owner: String,
        spender: String
    },
    Evolve {
        value: String
    },
    #[serde(rename_all = "camelCase")]
    ForeignRead {
        contract_tx_id: String
    },
    #[serde(rename_all = "camelCase")]
    ForeignWrite {
        contract_tx_id: String,
        qty: u64,
        target: String,
    },
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", untagged)]
pub enum QueryResponseMsg {
    Balance {
        ticker: String,
        target: String,
        balance: u64,
    },
    Allowance {
            ticker: String,
            owner: String,
            spender: String,
            allowance: u64,
    },
}

pub type ActionResult = Result<HandlerResult<State, QueryResponseMsg>, ContractError>;
