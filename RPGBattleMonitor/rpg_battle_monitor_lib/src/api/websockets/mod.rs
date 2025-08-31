use std::{sync::Arc, time::Duration};

use sea_orm::TransactionTrait;
use serde::{Deserialize, Serialize};
use socketioxide::{
    SocketIoBuilder,
    extract::{Data, Extension, SocketRef, State},
    handler::ConnectHandler,
    socket::DisconnectReason,
};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

use crate::{
    entity::{ClientsideEntity, Entity},
    models::entity::EntityManager,
    webserver::{
        router::app_state::AppStateTrait,
        services::websocket_auth::{self, WebsocketAuthMessage},
    },
};

const CHUNK_SIZE: usize = 50;

#[derive(Clone)]
struct JoinedFlag;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
#[serde(untagged)]
pub enum Action {
    Update,
    Create,
    Delete,
    Other(serde_json::Value),
}

impl Action {
    pub fn is_other(&self) -> bool {
        matches!(self, Action::Other(_))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionMessage {
    action: Action,
    data: Vec<ClientsideEntity>,
}

const ACTION: &str = "action";
const JOIN_EVENT: &str = "join";
const JOIN_FINISHED_EVENT: &str = "join-finished";

async fn update_handler<T: AppStateTrait>(
    data: ActionMessage,
    app_state: T,
    auth: WebsocketAuthMessage,
) {
    let queue = app_state.get_entity_queue();
    let mut lock = queue.lock().await;

    let shared_action = Arc::new(data.action);

    for entity in data.data {
        let entity = Entity {
            game: auth.game,
            uid: entity.uid,
            kind: entity.kind,
            timestamp: entity.timestamp,
            other_values: entity.other_values,
            action: Some(shared_action.clone()),
        };

        if let Err(e) = lock.push(entity) {
            tracing::error!(error = %e, "Failed to push entity to queue");
        }
    }
}

async fn action_handler<T: AppStateTrait>(
    socket: SocketRef,
    Data(data): Data<ActionMessage>,
    State(app_state): State<T>,
    Extension(auth): Extension<WebsocketAuthMessage>,
) {
    let rooms = socket.rooms();
    socket.to(rooms).emit(ACTION, &data).await.ok();

    match data.action {
        Action::Update => update_handler(data, app_state, auth).await,
        Action::Create => unimplemented!("Implement create action"),
        Action::Delete => unimplemented!("Implement delete action"),
        Action::Other(_) => tracing::warn!("Received unknown action: {:?}", data.action),
    }
}

#[tracing::instrument(skip(socket, app_state))]
async fn join_handler<T: AppStateTrait>(
    socket: SocketRef,
    State(app_state): State<T>,
    Extension(auth): Extension<WebsocketAuthMessage>,
) {
    let game_id = auth.game;
    let room = format!("room-{game_id}");

    tracing::debug!("Socket {} joining room {}", socket.id, auth.game);
    if socket.extensions.get::<JoinedFlag>().is_some() {
        tracing::debug!("Socket {} double join, ignoring", socket.id);
        return;
    }

    socket.on(ACTION, action_handler::<T>);
    socket.join(room);

    tracing::debug!("Fetching queued entities");
    let queue = app_state.get_entity_queue();
    {
        let mut lock = queue.lock().await;
        if let Some(handle) = lock.flush().await {
            handle.await.ok();
        }
    }

    tracing::debug!("Starting database entity fetch");
    let db = app_state.get_db();
    let transaction = match db.begin().await {
        Ok(t) => t,
        Err(e) => {
            tracing::error!("Failed to begin EntityQueue flush transaction: {}", e);
            return;
        }
    };
    let entity_manager = EntityManager::new();

    let db_comporessed_entities = match entity_manager.load_entities(&transaction, game_id).await {
        Ok(e) => e,
        Err(e) => {
            tracing::error!("Failed to load entities: {}", e);
            return;
        }
    };

    match transaction.commit().await {
        Ok(_) => (),
        Err(e) => {
            tracing::error!("Failed to commit EntityQueue flush transaction: {}", e);
            return;
        }
    }
    tracing::debug!("Finished database entity fetch");

    let entities = match Entity::decompress_vec(db_comporessed_entities) {
        Ok(e) => e,
        Err(e) => {
            tracing::error!("Failed to decompress entities: {}", e);
            return;
        }
    };

    let total = entities.len();
    let mut sent = 0;
    tracing::debug!("Sending entities in {} chunks", total / CHUNK_SIZE);
    entities.chunks(CHUNK_SIZE).for_each(|chunk| {
        sent += chunk.len();
        socket
            .emit(
                JOIN_EVENT,
                &serde_json::json!({
                    "progress": {
                        "sent": sent,
                        "total": total
                    },
                    "data": chunk
                }),
            )
            .ok();
    });

    tracing::debug!("Socket join finished sent");
    socket.emit(JOIN_FINISHED_EVENT, &()).ok();

    socket.extensions.insert(JoinedFlag);
    tracing::debug!("Socket joined");
}

pub fn on_connect<T: AppStateTrait>(socket: SocketRef) {
    tracing::info!(
        "Socket connected on namespace with namespace path: {}",
        socket.ns()
    );

    let socket_clone = socket.clone();
    socket.on_disconnect(move |reason: DisconnectReason| {
        tracing::info!(
            "Socket disconnected: {}, reason: {:?}",
            socket_clone.id,
            reason
        );
        socket_clone.extensions.remove::<JoinedFlag>();
    });

    socket.on(JOIN_EVENT, join_handler::<T>);
}

fn auth_middleware<T: AppStateTrait>(
    socket: SocketRef,
    State(app_state): State<T>,
    Data(auth): Data<WebsocketAuthMessage>,
) -> Result<(), websocket_auth::Error> {
    tracing::debug!("Authenticating user: {}", auth.user_token);
    match auth.authenticate(&app_state) {
        Ok(()) => {
            socket.extensions.insert(auth);
            Ok(())
        }
        Err(e) => Err(e),
    }
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    let (service, io) = SocketIoBuilder::new()
        .with_state(state.clone())
        .ping_timeout(Duration::from_secs(60))
        .ack_timeout(Duration::from_secs(60))
        .connect_timeout(Duration::from_secs(60))
        .build_svc();

    io.ns("/", on_connect::<T>.with(auth_middleware::<T>));

    axum::Router::new().route_service(
        "/socket.io/",
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .service(service),
    )
}
