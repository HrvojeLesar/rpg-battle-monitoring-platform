use crate::{
    cdn::filesystem::local_adapter::Local,
    webserver::router::app_state::{AppState, AppStateTrait},
};
use axum::{extract::DefaultBodyLimit, routing};
use sqlx::{Database, Sqlite};
use tower_http::limit::RequestBodyLimitLayer;

pub mod error;
pub mod filesystem;
pub mod model;
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
        use crate::apidoc::taggroups::tag_groups_config;
        use std::collections::HashSet;

        tag_groups_config().add("Assets".to_string(), HashSet::from(["Upload".to_string()]));
    }
}

pub fn get_router<T: AppStateTrait<Database = sqlx::Any>>(state: T) -> axum::Router {
    let upload_router = axum::Router::new()
        .route(
            "/upload",
            routing::post(upload::upload).get(upload::upload_form),
        )
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(FILE_SIZE_LIMIT))
        .with_state(state.clone());

    let router = axum::Router::new().merge(upload_router);

    axum::Router::new().nest(API_ASSETS, router)
}
