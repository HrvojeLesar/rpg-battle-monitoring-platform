#[cfg(feature = "api_v1_doc")]
use crate::apidoc;
use crate::{
    cdn::{self},
    webserver::router::app_state::AppStateTrait,
    websockets,
};

#[cfg(feature = "api_v1")]
const API_V1: &str = "/api/v1";

pub fn get_v1_api_router<T: AppStateTrait<Database = sqlx::Any>>(state: T) -> axum::Router<()> {
    let router = axum::Router::new();

    #[cfg(feature = "api_v1_doc")]
    let router = router.merge(apidoc::get_api_doc_router());

    let router = router
        .merge(websockets::get_router())
        .merge(cdn::get_router(state.clone()));

    axum::Router::new().nest(API_V1, router)
}
