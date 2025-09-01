use axum::{Json, routing};
use sea_orm::TransactionTrait;

use crate::{
    api::error::{Error, Result},
    models::game::{GameManager, GameModel},
    webserver::{
        extractors::database_connection_extractor::DbConn, router::app_state::AppStateTrait,
    },
};

pub async fn list_games(conn: DbConn) -> Result<Json<Vec<GameModel>>> {
    let game_mamager = GameManager::new();
    let transaction = conn.begin().await?;

    let games = game_mamager.list_games(&transaction).await?;

    transaction.commit().await?;

    Ok(Json(games))
}

pub async fn create_game(conn: DbConn) -> Result<Json<GameModel>> {
    let game_mamager = GameManager::new();
    let transaction = conn.begin().await?;

    let games = game_mamager.create_game(&transaction).await?;

    transaction.commit().await?;

    Ok(Json(games))
}

pub async fn join() -> Result<Json<()>> {
    unimplemented!("This should pair user with game")
}

pub fn get_router<T: AppStateTrait>(state: T) -> axum::Router {
    axum::Router::new()
        .route("/game/list", routing::get(list_games))
        .route("/game/create", routing::post(create_game))
        .route("/game/join", routing::get(join))
        .with_state(state.clone())
}
