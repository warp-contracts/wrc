use crate::error::ContractError;
use crate::state::State;
use serde::{Deserialize, Serialize};
use warp_contracts::handler_result::{ViewResult, WriteResult};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum Action {
    Transfer {
        to: String,
        amount: u64,
    },
    TransferFrom {
        from: String,
        to: String,
        amount: u64,
    },
    BalanceOf {
        target: String,
    },
    TotalSupply {},
    Approve {
        spender: String,
        amount: u64,
    },
    Allowance {
        owner: String,
        spender: String,
    },
    Evolve {
        value: String,
    },
}

#[derive(Serialize, Deserialize, Debug)]
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
    TotalSupply {
        value: u64,
    },
}

pub type ViewResponse = ViewResult<QueryResponseMsg, ContractError>;
pub type WriteResponse = WriteResult<State, ContractError>;
