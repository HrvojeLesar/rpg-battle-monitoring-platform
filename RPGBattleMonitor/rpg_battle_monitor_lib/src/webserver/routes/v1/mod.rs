#[cfg(feature = "api_v1_doc")]
use crate::apidoc;
use crate::{
    cdn::{self, filesystem::WritableFilesystem},
    webserver::router::app_state::AppState,
    websockets,
};

#[cfg(feature = "api_v1")]
const API_V1: &str = "/api/v1";

pub fn get_v1_api_router<DB, F>(_state: AppState<DB, F>) -> axum::Router<()>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
    F: WritableFilesystem,
{
    let router = axum::Router::new();

    #[cfg(feature = "api_v1_doc")]
    let router = router.merge(apidoc::get_api_doc_router());

    let router = router
        .merge(websockets::get_router())
        .merge(cdn::get_router());

    axum::Router::new().nest(API_V1, router)
}
