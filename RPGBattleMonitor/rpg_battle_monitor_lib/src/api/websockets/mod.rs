use std::{sync::Arc, time::Duration};

use bevy_ecs::world::World;
use serde::{Deserialize, Serialize};
use socketioxide::{
    SocketIoBuilder,
    extract::{AckSender, Data, SocketRef, State},
    socket::DisconnectReason,
};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

use crate::{game::GameManager, webserver::router::app_state::AppStateTrait};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Join {
    session_id: u64,
}

async fn join_handler<T: AppStateTrait>(
    socket: SocketRef,
    Data(join): Data<Join>,
    State(app_state): State<T>,
) {
    dbg!(join);
    let game_manager = if let Some(gm) = socket.extensions.get::<GameManager<T>>() {
        gm
    } else {
        let gm = GameManager::new(app_state).await.unwrap();
        socket.extensions.insert(gm.clone());
        gm
    };

    socket.emit("board", &game_manager.get_board()).ok();
}

pub fn on_connect<T: AppStateTrait>(socket: SocketRef) {
    println!(
        "Socket connected on dynamic namespace with namespace path: {}",
        socket.ns()
    );

    let socket_clone = socket.clone();
    socket.on_disconnect(move |reason: DisconnectReason| {
        println!(
            "Socket disconnected: {}, reason: {:?}",
            socket_clone.id, reason
        );
    });

    socket.on("join", join_handler::<T>);
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    let (service, io) = SocketIoBuilder::new()
        .with_state(state)
        .ping_timeout(Duration::from_secs(5))
        .build_svc();

    io.ns("/", on_connect::<T>);

    axum::Router::new().route_service(
        "/socket.io/",
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .service(service),
    )
}
