use axum::response::IntoResponse;
use thiserror::Error;

use crate::webserver::router::app_state::AppStateTrait;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    Multipart(#[from] axum::extract::multipart::MultipartError),

    #[error("Field has not name")]
    FieldHasNoName,

    #[error("Filename is empty")]
    FilenameEmpty,

    #[error("Data is empty")]
    DataEmpty,

    #[error(transparent)]
    DatabaseError(#[from] crate::database::error::Error),

    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),

    #[error("File not found")]
    FileNotFound { id: String },

    #[error(transparent)]
    JoinError(#[from] tokio::task::JoinError),

    #[error(transparent)]
    IoError(#[from] std::io::Error),

    #[error(transparent)]
    ModelsError(#[from] crate::models::error::Error),

    #[error(transparent)]
    DbError(#[from] sea_orm::DbErr),

    #[error("SocketIo state not found")]
    SocketIoStateNotFound,
}

impl<T: AppStateTrait> From<socketioxide::extract::StateNotFound<T>> for Error {
    fn from(_value: socketioxide::extract::StateNotFound<T>) -> Self {
        Self::SocketIoStateNotFound
    }
}

#[cfg(debug_assertions)]
impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        use axum::{Json, http::StatusCode};
        use serde_json::json;

        tracing::error!(error = %self);

        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "error": format!("{self:?}")
            })),
        )
            .into_response()
    }
}

#[cfg(not(debug_assertions))]
impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        use axum::http::StatusCode;

        tracing::error!(error = %self);

        match self {
            Self::FileNotFound { id: _ } => (StatusCode::NOT_FOUND).into_response(),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong").into_response(),
        }
    }
}
