use tower_http::services::ServeDir;

use crate::webserver::router::app_state::AppStateTrait;

#[cfg(feature = "api_doc")]
use utoipa::{Modify, OpenApi};

#[cfg(feature = "api_doc")]
#[derive(OpenApi)]
#[openapi(info(description = "Public files"), 
    modifiers(&ModifyDoc),
    nest(
        (path = "/{file_path}", api = self::ApiDocInner, tags = ["Public"])
    )
)]
pub struct ApiDoc;

#[cfg(feature = "api_doc")]
struct ModifyDoc;
#[cfg(feature = "api_doc")]
impl Modify for ModifyDoc {
    fn modify(&self, _openapi: &mut utoipa::openapi::OpenApi) {
        use std::collections::HashSet;

        use crate::api::doc::taggroups::tag_groups_config;

        tag_groups_config().add(
            "Public Files".to_string(),
            HashSet::from(["Public".to_string()]),
        );
    }
}

#[cfg(feature = "api_doc")]
#[derive(OpenApi)]
#[openapi(paths(get_router))]
struct ApiDocInner;

#[cfg_attr(all(feature = "api_doc"), utoipa::path(get, path = "",))]
pub fn get_router<T: AppStateTrait>(_state: T) -> axum::Router {
    let serve_dir_service = ServeDir::new("public");

    axum::Router::new().nest_service("/public", serve_dir_service.clone())
}
