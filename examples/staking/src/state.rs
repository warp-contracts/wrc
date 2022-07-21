use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub can_evolve: Option<bool>,
    pub evolve: Option<String>,
    pub owner: String,
    pub token: String,
    pub stakes: HashMap<String, u64>
}
