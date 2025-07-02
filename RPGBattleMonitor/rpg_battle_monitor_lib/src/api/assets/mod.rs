use crate::{
    api::assets::{
        serve::{serve_file, thumbnails},
        upload::{upload, upload_form},
    },
    webserver::router::app_state::AppStateTrait,
};
use axum::{extract::DefaultBodyLimit, routing};
use tower_http::limit::RequestBodyLimitLayer;

pub mod serve;
pub mod upload;

const API_ASSETS: &str = "/assets";

const FILE_SIZE_LIMIT: usize = 10 * 1024 * 1024; // 10MB

#[cfg(feature = "api_v1_doc")]
use utoipa::{Modify, OpenApi};

#[cfg(feature = "api_v1_doc")]
#[derive(OpenApi)]
#[openapi(info(description = "Assets API"), 
modifiers(&ModifyDoc),
nest(
    (path = "/assets", api = upload::ApiDoc, tags = ["Upload"])
))]
pub struct ApiDoc;

#[cfg(feature = "api_v1_doc")]
struct ModifyDoc;
#[cfg(feature = "api_v1_doc")]
impl Modify for ModifyDoc {
    fn modify(&self, _openapi: &mut utoipa::openapi::OpenApi) {
        use std::collections::HashSet;

        use crate::api::doc::taggroups::tag_groups_config;

        tag_groups_config().add("Assets".to_string(), HashSet::from(["Upload".to_string()]));
    }
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    let upload_router = axum::Router::new()
        .route("/upload", routing::post(upload).get(upload_form))
        .route("/thumbnails/{image_id}", routing::get(thumbnails))
        .route("/{filename}", routing::get(serve_file))
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(FILE_SIZE_LIMIT))
        .with_state(state.clone());

    let router = axum::Router::new().merge(upload_router);

    axum::Router::new().nest(API_ASSETS, router)
}
