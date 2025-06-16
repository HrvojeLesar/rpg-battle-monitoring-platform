use axum::response::IntoResponse;
use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Missing axum extension")]
    MissingExtension,
}

impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        todo!("Into response")
    }
}
