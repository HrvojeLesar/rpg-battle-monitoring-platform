use std::time::Duration;

use sea_orm::TransactionTrait;
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
    models::entity::{CompressedEntityModel, EntityManager},
    webserver::{
        router::app_state::AppStateTrait,
        services::websocket_auth::{self, WebsocketAuthMessage},
    },
};

const CHUNK_SIZE: usize = 50;

#[derive(Clone)]
struct JoinedFlag;

async fn action_handler<T: AppStateTrait>(
    socket: SocketRef,
    Data(entity): Data<ClientsideEntity>,
    State(app_state): State<T>,
    Extension(auth): Extension<WebsocketAuthMessage>,
) {
    let rooms = socket.rooms();
    socket.to(rooms).emit("action", &entity).await.ok();

    let entity = Entity {
        game: auth.game,
        uid: entity.uid,
        kind: entity.kind,
        timestamp: entity.timestamp,
        other_values: entity.other_values,
    };

    let queue = app_state.get_entity_queue();
    if let Err(e) = queue.lock().await.push(entity) {
        tracing::error!(error = %e, "Failed to push entity to queue");
    }
}

#[tracing::instrument(skip(socket, app_state))]
async fn join_handler<T: AppStateTrait>(
    socket: SocketRef,
    State(app_state): State<T>,
    Extension(auth): Extension<WebsocketAuthMessage>,
) {
    fn join_and_decompress_entities(
        mut entities: Vec<CompressedEntityModel>,
        mut other: Vec<CompressedEntityModel>,
    ) -> Result<Vec<Entity>, crate::entity::error::Error> {
        entities.append(&mut other);

        Entity::decompress_vec(entities)
    }

    let game_id = auth.game;
    let room = format!("room-{game_id}");

    tracing::debug!("Socket {} joining room {}", socket.id, auth.game);
    if socket.extensions.get::<JoinedFlag>().is_some() {
        tracing::debug!("Socket {} double join, ignoring", socket.id);
        return;
    }

    socket.on("action", action_handler::<T>);
    socket.join(room);

    tracing::debug!("Fetching queued entities");
    let queue = app_state.get_entity_queue();
    let compressed_entities;
    {
        let lock = queue.lock().await;
        compressed_entities = lock
            .entities
            .iter()
            .filter_map(|e| {
                if e.game != game_id {
                    None
                } else {
                    Some(e.clone())
                }
            })
            .collect::<Vec<_>>();
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

    let entities = match join_and_decompress_entities(db_comporessed_entities, compressed_entities)
    {
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
                "join",
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
    socket.emit("join-finished", &()).ok();

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

    socket.on("join", join_handler::<T>);
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
