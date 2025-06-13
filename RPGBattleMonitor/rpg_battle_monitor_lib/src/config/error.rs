use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    MaxConnectionsNotSet(#[from] std::env::VarError),
    #[error(transparent)]
    ParseIntError(#[from] core::num::ParseIntError),

    #[error("DATABASE_URL env variable is not set")]
    EnvMissingDatabaseUrl,
}
