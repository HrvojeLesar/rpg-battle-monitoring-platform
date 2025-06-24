use serde::{Deserialize, Serialize};

use crate::thumbnail::size::Size;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Configuration<'a> {
    pub name: &'a str,
    pub size: Size,
}

pub const X8: Configuration = Configuration {
    name: "8x8",
    size: Size::X8,
};

pub const X16: Configuration = Configuration {
    name: "16x16",
    size: Size::X16,
};

pub const X32: Configuration = Configuration {
    name: "32x32",
    size: Size::X32,
};

pub const X64: Configuration = Configuration {
    name: "64x64",
    size: Size::X64,
};

pub const X128: Configuration = Configuration {
    name: "128x128",
    size: Size::X128,
};

pub const X256: Configuration = Configuration {
    name: "256x256",
    size: Size::X256,
};

pub const X512: Configuration = Configuration {
    name: "512x512",
    size: Size::X512,
};

impl<'a> Configuration<'a> {
    pub fn new(name: &'a str, size: Size) -> Self {
        Self { name, size }
    }
}
