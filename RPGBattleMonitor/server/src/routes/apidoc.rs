use axum::Router;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

#[derive(OpenApi)]
#[openapi(
    nest(
        (path = "/api/v1/room", api = super::room::RoomApi),
    )
)]
pub struct ApiDoc;

pub fn get_api_doc_router<S>() -> impl Into<Router<S>>
where
    S: Clone + Send + Sync + 'static,
{
    Scalar::with_url("/api-docs", ApiDoc::openapi())
}
