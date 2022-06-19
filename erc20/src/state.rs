use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct State {
    // maybe symbol instead of ticker? (to be compatible with the standard)
    pub ticker: String,
    pub name: Option<String>,
    pub owner: String,
    pub evolve: Option<String>,
    pub can_evolve: Option<bool>,
    pub balances: HashMap<String, u64>,
    pub allowances: HashMap<String, HashMap<String, u64>>
}
