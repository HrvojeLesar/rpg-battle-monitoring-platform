use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    SerdeJsonError(#[from] serde_json::Error),

    #[error(transparent)]
    SeaOrmDbError(#[from] sea_orm::DbErr),

    #[error(transparent)]
    ModelError(#[from] crate::models::error::Error),

    #[error("{0}")]
    Custom(String),
}
