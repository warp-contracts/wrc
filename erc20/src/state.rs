use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct State {
    /*
    shouldn't the "divisibility" or "decimals" (as in original ERC-20) be added here?
    and used in the implementation...
     */
    pub ticker: String,
    pub name: Option<String>,
    pub owner: String,
    pub evolve: Option<String>,
    pub can_evolve: Option<bool>,
    pub balances: HashMap<String, u64>,
    pub allowances: HashMap<String, HashMap<String, u64>>
}
