use serde::{Deserialize, Serialize};

use crate::contract_utils::handler_result::HandlerResult;
use crate::error::ContractError;
use crate::state::State;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum Action {
    #[serde(rename_all = "camelCase")]
    Stake {
        amount: u64
    },
    Withdraw {
        amount: u64
    },
    StakeOf {
        target: String
    },
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", untagged)]
pub enum QueryResponseMsg {
    Stake {
        stake: u64,
    }
}

pub type ActionResult = Result<HandlerResult<State, QueryResponseMsg>, ContractError>;
