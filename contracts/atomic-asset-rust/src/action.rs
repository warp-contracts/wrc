use serde::{Deserialize, Serialize};

use crate::error::ContractError;
use crate::state::State;
use warp_wasm_utils::contract_utils::handler_result::HandlerResult;

#[derive(Deserialize)]
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
    TotalSupply {
        value: u64,
    },
}

pub type ActionResult = Result<HandlerResult<State, QueryResponseMsg>, ContractError>;
