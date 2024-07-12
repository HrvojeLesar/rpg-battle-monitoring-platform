use serde::{Deserialize, Serialize};

use super::payload::V1MessagePayloads;

#[derive(Debug, Serialize, Deserialize)]
pub enum V1MessageTypes {
    Pos,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "version", content = "message")]
pub enum Message {
    V1(V1MessagePayloads),
}
