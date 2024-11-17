use axum::http::StatusCode;

pub trait ApiError {
    fn status_code(&self) -> StatusCode;
    fn message(&self) -> &str;
}
