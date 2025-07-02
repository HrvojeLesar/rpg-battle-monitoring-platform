use std::time::Duration;

use socketioxide::{SocketIoBuilder, extract::SocketRef, socket::DisconnectReason};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

pub fn on_connect(socket: SocketRef) {
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
}

pub fn get_router() -> axum::Router {
    let (service, io) = SocketIoBuilder::new()
        .ping_timeout(Duration::from_secs(5))
        .build_svc();

    io.ns("/", on_connect);

    axum::Router::new().route_service(
        "/socket.io/",
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .service(service),
    )
}
