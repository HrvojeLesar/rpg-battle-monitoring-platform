use axum::{
    extract::{Path, State},
    routing,
};

use crate::webserver::router::global_router_state::GlobalRouterStateTrait;

pub fn create_test_router<T: GlobalRouterStateTrait>(state: T) -> axum::Router<()> {
    axum::Router::new()
        .route("/test-1", routing::get(test1::<T>))
        .route("/test-2/{lmao}", routing::get(test2::<T>))
        .with_state(state)
}

async fn test1<T: GlobalRouterStateTrait>(State(global_state): State<T>) -> String {
    "test".into()
}

async fn test2<T: GlobalRouterStateTrait>(
    State(global_state): State<T>,
    Path(lmao): Path<i32>,
) -> String {
    format!("Lmaoaoao si {}", lmao)
}
