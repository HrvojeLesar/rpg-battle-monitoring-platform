use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum V1MessagePayloads {
    Position(PositionPayload),
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct PositionPayload {
    pub x: f64,
    pub y: f64,
}
