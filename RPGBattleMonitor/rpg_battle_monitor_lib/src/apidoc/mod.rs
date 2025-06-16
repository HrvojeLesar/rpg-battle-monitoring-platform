use axum::Router;
use utoipa::{Modify, OpenApi};
use utoipa_scalar::{Scalar, Servable};

use crate::apidoc::taggroups::tag_groups_config;

pub mod taggroups;

#[derive(OpenApi)]
#[openapi(
    info(description = "My Api description"),
    modifiers(&ApiDocMod),
    nest(
        (path = "/api/v1", api = crate::cdn::ApiDoc, tags = [])
    )
)]
pub struct ApiDocRoot;

#[utoipa::path(
    get,
    path = "/api/v1/docs", 
    responses(
        (status = 200, description = "Api Documentation Page")
    )
)]
pub(super) fn get_api_doc_router<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    let doc = ApiDocRoot::openapi();

    Scalar::with_url("/docs", doc).into()
}

struct ApiDocMod;
impl Modify for ApiDocMod {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        openapi.extensions = Some(tag_groups_config().to_extension());
    }
}
