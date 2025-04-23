use super::router::global_router_state::GlobalRouterStateTrait;

#[cfg(feature = "api_v1_doc")]
pub mod apidoc;

mod test_routes;

#[cfg(feature = "api_v1")]
const API_V1: &str = "/api/v1";

pub fn get_v1_api_router<T: GlobalRouterStateTrait>(state: T) -> axum::Router<()> {
    let router = axum::Router::new();

    #[cfg(feature = "api_v1_doc")]
    let router = router.merge(apidoc::get_api_doc_router());

    axum::Router::new().nest(API_V1, router)
}
