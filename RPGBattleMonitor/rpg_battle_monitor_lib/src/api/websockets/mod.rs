use std::time::Duration;

use socketioxide::{
    SocketIoBuilder,
    extract::{Data, SocketRef},
    socket::DisconnectReason,
};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

use crate::{entity::Entity, webserver::router::app_state::AppStateTrait};

async fn action_handler<T: AppStateTrait>(
    socket: SocketRef,
    Data(entity): Data<Entity>,
    // State(app_state): State<T>,
) {
    dbg!(&entity);
    socket.broadcast().emit("action", &entity).await.ok();
}

pub fn on_connect<T: AppStateTrait>(socket: SocketRef) {
    println!(
        "Socket connected on namespace with namespace path: {}",
        socket.ns()
    );

    let socket_clone = socket.clone();
    socket.on_disconnect(move |reason: DisconnectReason| {
        println!(
            "Socket disconnected: {}, reason: {:?}",
            socket_clone.id, reason
        );
    });

    socket.on("action", action_handler::<T>);
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
