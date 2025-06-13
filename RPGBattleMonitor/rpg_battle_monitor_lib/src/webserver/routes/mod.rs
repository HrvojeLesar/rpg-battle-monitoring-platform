use crate::{cdn, webserver::router::app_state::AppState};

#[cfg(feature = "api_v1_doc")]
pub mod apidoc;

mod websocket;

#[cfg(feature = "api_v1")]
const API_V1: &str = "/api/v1";

pub fn get_v1_api_router(_state: AppState) -> axum::Router<()> {
    let router = axum::Router::new();

    #[cfg(feature = "api_v1_doc")]
    let router = router.merge(apidoc::get_api_doc_router());

    let router = router
        .merge(websocket::get_router())
        .merge(cdn::get_router());

    axum::Router::new().nest(API_V1, router)
}
