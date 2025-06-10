use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Size {
    X8,
    X16,
    X32,
    X64,
    X128,
    X256,
    X512,
    Custom((u32, u32)),
}

impl Size {
    pub fn get_dimensions(&self) -> (u32, u32) {
        match self {
            Size::X8 => (8, 8),
            Size::X16 => (16, 16),
            Size::X32 => (32, 32),
            Size::X64 => (64, 64),
            Size::X128 => (128, 128),
            Size::X256 => (256, 256),
            Size::X512 => (512, 512),
            Size::Custom(size) => *size,
        }
    }
}
