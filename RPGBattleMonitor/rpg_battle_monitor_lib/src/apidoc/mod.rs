use axum::Router;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

#[cfg(feature = "api_v1_doc")]
#[derive(OpenApi)]
#[openapi(info(description = "My Api description"), paths(get_api_doc_router))]
pub struct ApiDoc;

#[cfg(feature = "api_v1_doc")]
#[cfg_attr(feature = "api_v1_doc",
    utoipa::path(
        get,
        path = "/api/v1/docs", 
        responses(
            (status = 200, description = "Api Documentation Page")
        )
    )
)]
pub(super) fn get_api_doc_router<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    let doc = ApiDoc::openapi();

    Scalar::with_url("/docs", doc).into()
}
