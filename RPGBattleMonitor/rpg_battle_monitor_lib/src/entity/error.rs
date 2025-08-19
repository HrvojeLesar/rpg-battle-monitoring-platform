use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Failed to compress entity")]
    EntityCompressionFailed(std::io::Error),

    #[error("Failed to decompress entity")]
    EntityDecompressionFailed(std::io::Error),

    #[error(transparent)]
    SerdeJsonError(#[from] serde_json::Error),
}
