use std::{env, sync::Arc};

use axum::{
    RequestExt, Router,
    body::{Body, HttpBody},
    extract::{Query, State},
    http::{Request, Response, StatusCode},
    routing,
};

use rpg_battle_monitor_lib::{
    game::Game,
    global_router_state::GlobalRouterState,
    routes::{self, apidoc},
};
use serde_json::Value;
use socketioxide::{
    SocketIo,
    extract::{AckSender, Data, Extension, SocketRef, TryData},
    handler::ConnectHandler,
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
    socket.emit("auth", &data).ok();

    socket.on("pos", |Data::<Value>(data), socket: SocketRef| {
        warn!("{:#?}", data);
        socket.broadcast().emit("changepos", &data);
    });
    socket.broadcast().to("test").emit("test", "test");
}

fn do_auth(socket: SocketRef, Data(data): Data<Value>) -> Result<(), String> {
    tracing::warn!("{:#?}", data);
    tracing::warn!("NS: {:#?}", socket.ns());
    let room = data.get("room").unwrap().as_str().unwrap();
    socket.join(room.to_string());
    Ok(())
}

fn get_port() -> String {
    env::var("PORT").unwrap_or("3000".to_string())
}

async fn inc(State(global_state): State<Arc<std::sync::Mutex<Game>>>) -> &'static str {
    let lock = global_state.lock().unwrap();
    let lua = &lock.lua;
    // lua.load();

    "test"
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
