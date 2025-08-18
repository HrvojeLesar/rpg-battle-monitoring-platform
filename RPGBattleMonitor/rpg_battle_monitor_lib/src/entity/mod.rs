use serde::{Deserialize, Serialize};

pub mod error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UId(String);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UtcTimestamp(i64);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    kind: String,
    uid: UId,
    timestamp: UtcTimestamp,
    #[serde(flatten)]
    other_values: serde_json::Value,
}
