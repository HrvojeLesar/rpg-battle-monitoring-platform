use axum::response::IntoResponse;
use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    Multipart(#[from] axum::extract::multipart::MultipartError),

    #[error("Field has not name")]
    FieldHasNoName,

    #[error("filename is empty")]
    FilenameEmpty,
    #[error("data is empty")]
    DataEmpty,

    #[error(transparent)]
    CdnError(#[from] crate::cdn::filesystem::error::Error),

    #[error(transparent)]
    DatabaseError(#[from] crate::database::error::Error),

    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),

    #[error(transparent)]
    ImageError(#[from] image::error::ImageError),

    #[error("File not found")]
    FileNotFound { id: String },
}

#[cfg(debug_assertions)]
impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        use axum::Json;
        use serde_json::json;

        tracing::error!(error = %self);

        Json(json!({
            "error": format!("{self:?}")
        }))
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
