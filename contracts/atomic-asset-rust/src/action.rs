use crate::{error::ContractError, state::State};
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
    IncreaseAllowance {
        spender: String,
        #[serde(rename(deserialize = "amountToAdd"))]
        amount_to_add: u64,
    },
    DecreaseAllowance {
        spender: String,
        #[serde(rename(deserialize = "amountToSubtract"))]
        amount_to_subtract: u64,
    },
    Owner {},
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase", untagged)]
pub enum QueryResponseMsg {
    Balance {
        target: String,
        balance: u64,
    },
    Allowance {
        owner: String,
        spender: String,
        allowance: u64,
    },
    TotalSupply {
        value: u64,
    },
    Owner {
        value: Option<String>,
    },
}

pub type WriteResponse = WriteResult<State, ContractError>;
pub type ViewResponse = ViewResult<QueryResponseMsg, ContractError>;
