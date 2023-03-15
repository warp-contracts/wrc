use crate::{error::ContractError, state::State};
use serde::{Deserialize, Serialize};
use warp_contracts::handler_result::{ViewResult, WriteResult};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum Action {
    #[serde(rename_all = "camelCase")]
    Stake {
        amount: u64,
    },
    Withdraw {
        amount: u64,
    },
    StakeOf {
        target: String,
    },
    StakeAll {},
    ReStake {},
    Evolve {
        value: String,
    },
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase", untagged)]
pub enum QueryResponseMsg {
    Stake { stake: u64 },
}

pub type WriteResponse = WriteResult<State, ContractError>;
pub type ViewResponse = ViewResult<QueryResponseMsg, ContractError>;
