use tower_http::cors::CorsLayer;

use crate::webserver::router::app_state::AppStateTrait;

pub mod assets;
#[cfg(feature = "api_doc")]
pub mod doc;
pub mod websockets;

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    let router = axum::Router::new();

    #[cfg(feature = "api_doc")]
    let router = router.merge(doc::get_api_doc_router());

    let router = router
        .merge(websockets::get_router())
        .merge(assets::get_router(state))
        .layer(CorsLayer::permissive());

    axum::Router::new().nest("/api", router)
}
