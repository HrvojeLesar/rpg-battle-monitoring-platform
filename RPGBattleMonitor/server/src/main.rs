use axum::{
    body::{Body, HttpBody},
    extract::Query,
    http::{Request, Response, StatusCode},
    RequestExt, Router,
};

use serde_json::Value;
use socketioxide::{
    extract::{Data, Extension, SocketRef, TryData},
    handler::ConnectHandler,
    SocketIo,
};

use tower::{Layer, ServiceBuilder};
use tower_http::{
    auth::{AsyncAuthorizeRequest, AsyncRequireAuthorization, AsyncRequireAuthorizationLayer},
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing::warn;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod database;
mod monitor;
mod socket;

fn on_connect(socket: SocketRef, Data(data): Data<Value>) {
    warn!("Socket.IO connected: {:?} {:?}", socket.ns(), socket.id);
    socket.emit("auth", data).ok();

    socket.on("pos", |Data::<Value>(data), socket: SocketRef| {
        warn!("{:#?}", data);
        socket.broadcast().emit("changepos", &data).ok();
    });
    socket.broadcast().to("test").emit("test", "test").ok();
}

fn do_auth(socket: SocketRef, Data(data): Data<Value>) -> Result<(), String> {
    tracing::warn!("{:#?}", data);
    tracing::warn!("NS: {:#?}", socket.ns());
    let room = data.get("room").unwrap().as_str().unwrap();
    socket.join(room.to_string()).unwrap();
    Ok(())
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_websockets=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let (socketio_layer, io) = SocketIo::new_layer();
    io.ns("/ws", on_connect.with(do_auth));
    io.dyn_ns("/{test_ns}", on_connect.with(do_auth)).unwrap();

    let app = Router::new()
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(socketio_layer),
        )
        // logging so we can see whats going on
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    // run it with hyper
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
