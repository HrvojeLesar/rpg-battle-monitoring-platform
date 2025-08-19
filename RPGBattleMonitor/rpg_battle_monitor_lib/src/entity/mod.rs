use std::io::{Read, Write};

use flate2::{Compression, read::GzDecoder, write::GzEncoder};
use image::EncodableLayout;
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

impl TryFrom<Entity> for CompressedEntityModel {
    type Error = Error;

    fn try_from(value: Entity) -> std::result::Result<Self, Self::Error> {
        let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
        encoder
            .write_all(value.other_values.to_string().as_bytes())
            .map_err(Error::EntityCompressionFailed)?;
        Ok(CompressedEntityModel {
            uid: value.uid.0,
            game: value.game,
            kind: value.kind,
            timestamp: value.timestamp.0,
            data: encoder.finish().map_err(Error::EntityCompressionFailed)?,
        })
    }
}

impl TryFrom<CompressedEntityModel> for Entity {
    type Error = Error;

    fn try_from(value: CompressedEntityModel) -> std::result::Result<Self, Self::Error> {
        let mut decoder = GzDecoder::new(value.data.as_slice());
        let mut data = Vec::new();
        decoder
            .read_to_end(&mut data)
            .map_err(Error::EntityDecompressionFailed)?;

        let other_values = serde_json::from_reader(data.as_bytes())?;

        Ok(Entity {
            uid: UId(value.uid),
            game: value.game,
            kind: value.kind,
            timestamp: UtcTimestamp(value.timestamp),
            other_values,
        })
    }
}
