use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),

    #[error("There is no active transaction")]
    NoTransaction,

    #[error(transparent)]
    SeaOrmDbError(#[from] sea_orm::DbErr),
}
