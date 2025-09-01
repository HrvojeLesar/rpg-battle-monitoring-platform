use crate::webserver::router::app_state::AppStateTrait;
use axum::{extract::DefaultBodyLimit, routing};
use tower_http::limit::RequestBodyLimitLayer;

pub mod serve;
pub mod upload;

const FILE_SIZE_LIMIT: usize = 10 * 1024 * 1024; // 10MB

#[cfg(feature = "api_doc")]
use utoipa::{Modify, OpenApi};

#[cfg(feature = "api_doc")]
#[derive(OpenApi)]
#[openapi(info(description = "Assets API"), 
modifiers(&ModifyDoc),
nest(
    (path = "/assets", api = upload::ApiDoc, tags = ["Upload"]),
    (path = "/assets", api = serve::ApiDoc, tags = ["Serve"])
))]
pub struct ApiDoc;

#[cfg(feature = "api_doc")]
struct ModifyDoc;
#[cfg(feature = "api_doc")]
impl Modify for ModifyDoc {
    fn modify(&self, _openapi: &mut utoipa::openapi::OpenApi) {
        use std::collections::HashSet;

        use crate::api::doc::taggroups::tag_groups_config;

        tag_groups_config().add("Assets".to_string(), HashSet::from(["Upload".to_string()]));
        tag_groups_config().add("Assets".to_string(), HashSet::from(["Serve".to_string()]));
    }
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    axum::Router::new()
        .route(
            "/assets/upload",
            #[cfg(debug_assertions)]
            {
                routing::post(upload::upload).get(upload::upload_form)
            },
            #[cfg(not(debug_assertions))]
            {
                routing::post(upload::upload)
            },
        )
        .route(
            "/assets/thumbnails/{image_id}",
            routing::get(serve::thumbnails),
        )
        .route("/assets/{filename}", routing::get(serve::serve_file))
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(FILE_SIZE_LIMIT))
        .with_state(state.clone())
}

#[allow(dead_code)]
pub(super) fn gen_partial_asset_url(filename: &str) -> String {
    format!("/api/assets/{filename}")
}
