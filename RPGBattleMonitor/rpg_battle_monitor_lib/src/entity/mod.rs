use std::io::{Read, Write};

use flate2::{Compression, read::GzDecoder, write::GzEncoder};
use image::EncodableLayout;
use serde::{Deserialize, Serialize};

pub mod error;
pub mod kind;

use crate::{entity::kind::EntityKind, models::entity::CompressedEntityModel};

use self::error::{Error, Result};

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct UId(pub String);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UtcTimestamp(pub i64);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientsideEntity {
    pub uid: UId,
    pub kind: EntityKind,
    pub timestamp: UtcTimestamp,
    #[serde(flatten)]
    pub other_values: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub uid: UId,
    pub game: i32,
    pub kind: EntityKind,
    pub timestamp: UtcTimestamp,
    #[serde(flatten)]
    pub other_values: serde_json::Value,
}

impl Entity {
    pub fn decompress_vec(compressed: Vec<CompressedEntityModel>) -> Result<Vec<Entity>> {
        let mut decompressed = Vec::with_capacity(compressed.len());
        for entity in compressed {
            decompressed.push(entity.try_into()?);
        }

        Ok(decompressed)
    }

    // pub fn sort_entities(mut entities: Vec<Entity>) -> Vec<Entity> {
    //     entities.sort_by_key(|e| e.kind.get_sort_order());
    //
    //     entities
    // }
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
            kind: value.kind.0,
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
            kind: EntityKind(value.kind),
            timestamp: UtcTimestamp(value.timestamp),
            other_values,
        })
    }
}
