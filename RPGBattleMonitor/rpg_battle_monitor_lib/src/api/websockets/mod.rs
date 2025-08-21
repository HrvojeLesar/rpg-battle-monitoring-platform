use std::time::Duration;

use sea_orm::TransactionTrait;
use socketioxide::{
    SocketIoBuilder,
    extract::{Data, SocketRef, State},
    socket::DisconnectReason,
};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

use crate::{
    entity::Entity,
    models::entity::{CompressedEntityModel, EntityManager},
    webserver::router::app_state::AppStateTrait,
};

async fn action_handler<T: AppStateTrait>(
    socket: SocketRef,
    Data(entity): Data<Entity>,
    State(app_state): State<T>,
) {
    let rooms = socket.rooms();
    socket.to(rooms).emit("action", &entity).await.ok();

    let queue = app_state.get_entity_queue();
    if let Err(e) = queue.lock().await.push(entity) {
        tracing::error!(error = %e, "Failed to push entity to queue");
    }
}

async fn join_handler<T: AppStateTrait>(socket: SocketRef, State(app_state): State<T>) {
    fn join_and_decompress_entities(
        mut entities: Vec<CompressedEntityModel>,
        mut other: Vec<CompressedEntityModel>,
    ) -> Result<Vec<Entity>, crate::entity::error::Error> {
        entities.append(&mut other);

        Entity::decompress_vec(entities)
    }

    socket.on("action", action_handler::<T>);
    socket.join("room-1");

    let game_id = 0;

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

    let entities = match join_and_decompress_entities(db_comporessed_entities, compressed_entities)
    {
        Ok(e) => Entity::sort_entities(e),
        Err(e) => {
            tracing::error!("Failed to decompress entities: {}", e);
            return;
        }
    };

    let total = entities.len();
    let mut sent = 0;
    entities.chunks(50).for_each(|chunk| {
        sent += chunk.len();
        socket.emit("join", &chunk).ok();
        socket
            .emit(
                "join-progress",
                &serde_json::json!({"progress": sent, "total": total}),
            )
            .ok();
    });

    socket.emit("join-finished", &()).ok();
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

    socket.on("join", join_handler::<T>);
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    let (service, io) = SocketIoBuilder::new()
        .with_state(state)
        .ping_timeout(Duration::from_secs(60))
        .ack_timeout(Duration::from_secs(60))
        .connect_timeout(Duration::from_secs(60))
        .build_svc();

    io.ns("/", on_connect::<T>);

    axum::Router::new().route_service(
        "/socket.io/",
        ServiceBuilder::new()
            .layer(CorsLayer::permissive())
            .service(service),
    )
}
