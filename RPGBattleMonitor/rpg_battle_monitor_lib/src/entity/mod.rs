use std::io::Write;

use flate2::{Compression, write::ZlibEncoder};
use serde::{Deserialize, Serialize};

pub mod error;

use crate::models::entity::CompressedEntityModel;

use self::error::{Error, Result};

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct UId(pub String);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UtcTimestamp(pub i64);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub uid: UId,
    pub game: i32,
    pub kind: String,
    pub timestamp: UtcTimestamp,
    #[serde(flatten)]
    pub other_values: serde_json::Value,
}

impl Entity {
    pub fn to_compressed(self) -> Result<CompressedEntityModel> {
        let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
        encoder
            .write_all(self.other_values.to_string().as_bytes())
            .map_err(Error::EntityCompressionFailed)?;
        Ok(CompressedEntityModel {
            uid: self.uid.0,
            game: self.game,
            kind: self.kind,
            timestamp: self.timestamp.0,
            data: encoder.finish().map_err(Error::EntityCompressionFailed)?,
        })
    }
}
