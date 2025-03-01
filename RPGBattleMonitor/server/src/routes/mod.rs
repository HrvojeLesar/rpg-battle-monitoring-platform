use axum::{routing, Router};

use crate::global_router_state::GlobalRouterState;

pub mod apidoc;
pub mod error;
pub mod room;

const API_V1: &str = "/api/v1";

pub fn routes_config(state: GlobalRouterState) -> Router {
    v1_api_router(state)
}

pub fn v1_api_router(state: GlobalRouterState) -> Router {
    let room_routes = Router::new().merge(room::router(state));

    Router::new().nest(API_V1, room_routes)
}
