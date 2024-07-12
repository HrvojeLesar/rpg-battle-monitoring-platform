use thiserror::Error;

#[derive(Error, Debug)]
pub enum ModelError {
    #[error(transparent)]
    Database(#[from] sqlx::Error),
    #[error(transparent)]
    Ulid(#[from] ulid::DecodeError),
}
