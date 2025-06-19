use crate::webserver::router::app_state::AppStateTrait;
use axum::{extract::DefaultBodyLimit, routing};
use tower_http::limit::RequestBodyLimitLayer;

pub mod error;
pub mod filesystem;
pub mod model;
pub mod routes;

const API_ASSETS: &str = "/assets";

const FILE_SIZE_LIMIT: usize = 10 * 1024 * 1024; // 10MB

#[cfg(feature = "api_v1_doc")]
use utoipa::{Modify, OpenApi};

#[cfg(feature = "api_v1_doc")]
#[derive(OpenApi)]
#[openapi(info(description = "Assets API"), 
modifiers(&ModifyDoc),
nest(
    (path = "/assets", api = routes::upload::ApiDoc, tags = ["Upload"])
))]
pub struct ApiDoc;

#[cfg(feature = "api_v1_doc")]
struct ModifyDoc;
#[cfg(feature = "api_v1_doc")]
impl Modify for ModifyDoc {
    fn modify(&self, _openapi: &mut utoipa::openapi::OpenApi) {
        use crate::apidoc::taggroups::tag_groups_config;
        use std::collections::HashSet;

        tag_groups_config().add("Assets".to_string(), HashSet::from(["Upload".to_string()]));
    }
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    let upload_router = axum::Router::new()
        .route(
            "/upload",
            routing::post(routes::upload::upload).get(routes::upload::upload_form),
        )
        .route("/{asset_id}", routing::get(routes::serve::serve_file))
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(FILE_SIZE_LIMIT))
        .with_state(state.clone());

    let router = axum::Router::new().merge(upload_router);

    axum::Router::new().nest(API_ASSETS, router)
}
