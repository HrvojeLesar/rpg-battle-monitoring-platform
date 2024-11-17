use axum::{http::StatusCode, response::IntoResponse, Json};
use thiserror::Error;

use crate::error::ApiError;

// #[derive(Error, Debug)]
// pub enum RoomApiError {
//     #[error(transparent)]
//     SqlxError(#[from] sqlx::Error),
//     #[error(transparent)]
//     ModelError(#[from] crate::models::error::ModelError),
//     #[error("{0}")]
//     Other(&'static str),
// }

#[derive(Debug)]
pub struct RoomApiError(anyhow::Error);

impl<E> From<E> for RoomApiError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

// impl ApiError for RoomApiError {
//     fn status_code(&self) -> StatusCode {
//         match self {
//             RoomApiError::SqlxError(_) => StatusCode::INTERNAL_SERVER_ERROR,
//             RoomApiError::ModelError(_) => StatusCode::INTERNAL_SERVER_ERROR,
//             RoomApiError::Other(_) => StatusCode::INTERNAL_SERVER_ERROR,
//         }
//     }
//
//     fn message(&self) -> &str {
//         match self {
//             RoomApiError::SqlxError(_) => "sqlx_error",
//             RoomApiError::ModelError(_) => "model_error",
//             RoomApiError::Other(e) => e,
//         }
//     }
// }

impl IntoResponse for RoomApiError {
    fn into_response(self) -> axum::response::Response {
        tracing::error!(
            "Error: {:#?} Backtrace: {:#?}",
            &self.0,
            &self.0.backtrace()
        );
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Something went wrong: {}", self.0),
        )
            .into_response()
    }
}
