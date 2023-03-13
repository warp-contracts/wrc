use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub symbol: String,
    pub name: Option<String>,
    pub decimals: u8,
    pub total_supply: u64,
    pub balances: HashMap<String, u64>,
    pub allowances: HashMap<String, HashMap<String, u64>>,

    //Evolve interface
    pub owner: String,
    pub evolve: Option<String>,
    pub can_evolve: Option<bool>,
}
