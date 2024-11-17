use std::env;

use axum::{
    body::{Body, HttpBody},
    extract::Query,
    http::{Request, Response, StatusCode},
    RequestExt, Router,
};

use rpg_battle_monitor_lib::{
    global_router_state::GlobalRouterState,
    routes::{self, apidoc},
};
use serde_json::Value;
use socketioxide::{
    extract::{AckSender, Bin, Data, Extension, SocketRef, TryData},
    handler::ConnectHandler,
    SocketIo,
};

use tower::{Layer, ServiceBuilder};
use tower_http::{
    auth::{AsyncAuthorizeRequest, AsyncRequireAuthorization, AsyncRequireAuthorizationLayer},
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing::{info, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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

fn get_port() -> String {
    env::var("PORT").unwrap_or("3000".to_string())
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                "rpg_battle_monitor_server=debug,tower_http=debug,socketioxide=debug".into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let (socketio_layer, io) = SocketIo::new_layer();

    io.ns("/ws", on_connect.with(do_auth));

    let global_state = GlobalRouterState::new().await;

    let mut app = axum::Router::new();

    app = app.merge(crate::routes::routes_config(global_state));

    #[cfg(debug_assertions)]
    {
        app = app.merge(apidoc::get_api_doc_router());
    }

    app = app
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(socketio_layer),
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", get_port()))
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
