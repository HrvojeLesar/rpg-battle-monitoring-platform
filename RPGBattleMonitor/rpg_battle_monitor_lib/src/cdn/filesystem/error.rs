use std::path::PathBuf;

use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    IoError(#[from] std::io::Error),

    #[error("File was not found on path: {path}")]
    FileNotFound { path: PathBuf },
}
