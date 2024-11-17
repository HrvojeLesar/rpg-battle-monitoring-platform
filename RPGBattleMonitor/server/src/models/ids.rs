use std::ops::Deref;

use serde::{Deserialize, Serialize};
use ulid::Ulid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RoomId(pub Ulid);

impl RoomId {
    pub fn new() -> Self {
        Self(Ulid::new())
    }
}

impl TryFrom<String> for RoomId {
    type Error = ulid::DecodeError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        let ulid = value.parse()?;

        Ok(Self(ulid))
    }
}

impl Default for RoomId {
    fn default() -> Self {
        RoomId::new()
    }
}

impl Deref for RoomId {
    type Target = Ulid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
