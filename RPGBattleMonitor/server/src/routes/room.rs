use std::fs::File;

use axum::{
    extract::{Query, State},
    routing, Json, Router,
};
use utoipa::OpenApi;

use crate::{
    global_router_state::{GlobalRouterState, GlobalRouterStateTrait},
    models::{ids::RoomId, room::Room},
};

use super::error::RoomApiError;

#[derive(OpenApi)]
#[openapi(paths(create), components(schemas()))]
pub(super) struct RoomApi;

pub(super) fn router(state: GlobalRouterState) -> Router {
    Router::new().nest(
        "/room",
        Router::new()
            .route("/create", routing::get(create))
            .route("/join/{id}", routing::get(join))
            .with_state(state),
    )
}

#[utoipa::path(
    get,
    path = "/crate",
    responses(
        (status = OK, description = "Creates a new room", body = String),
        (status = INTERNAL_SERVER_ERROR, description = "Server error"),
    )
)]
async fn create(
    State(global_state): State<GlobalRouterState>,
) -> Result<Json<RoomId>, RoomApiError> {
    let room = Room::new();
    let mut transaction = global_state.get_connection_pool().begin().await?;

    room.insert(&mut transaction).await?;
    transaction.commit().await?;

    Ok(Json(room.id))
}

#[utoipa::path(
    get,
    path = "/join/{room_id}",
    responses(
        (status = 200, description = "Test description"),
    )
)]
async fn join(
    Query(room_id): Query<RoomId>,
    State(global_state): State<GlobalRouterState>,
) -> Result<Json<RoomId>, RoomApiError> {
    let room = Room::new();
    Ok(Json(room.id))
}
