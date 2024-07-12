use axum::Router;

use serde_json::Value;
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};

use tower::ServiceBuilder;
use tower_http::{
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing::warn;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod database;
mod sockets;

fn on_connect(socket: SocketRef, Data(data): Data<Value>) {
    warn!("Socket.IO connected: {:?} {:?}", socket.ns(), socket.id);
    socket.emit("auth", data).ok();

    socket.on("pos", |Data::<Value>(data), socket: SocketRef| {
        warn!("{:#?}", data);
        socket.broadcast().emit("changepos", &data).ok();
    });
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_websockets=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer().pretty())
        .init();

    let (socketio_layer, io) = SocketIo::new_layer();
    io.ns("/", on_connect);
    io.ns("/ws", on_connect);

    let app = Router::new()
        // logging so we can see whats going on
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(socketio_layer),
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    // run it with hyper
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
