use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub(super) struct Size {
    pub(super) width: u64,
    pub(super) height: u64,
}

impl Default for Size {
    fn default() -> Self {
        Self {
            width: 64,
            height: 64,
        }
    }
}

impl Size {
    pub(super) fn new(width: u64, height: u64) -> Self {
        Self { width, height }
    }
}
