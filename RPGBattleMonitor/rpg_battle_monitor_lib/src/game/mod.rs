use std::sync::{Arc, Mutex};

use sea_orm::TransactionTrait;

use crate::game::objects::board::Board;
use crate::{
    game::objects::scene::Scene, models::board::BoardManager,
    webserver::router::app_state::AppStateTrait,
};

use crate::game::error::{Error, Result};

pub mod error;
pub(crate) mod objects;
mod utils;

#[derive(Debug, Clone)]
pub struct GameManager<T: AppStateTrait> {
    pub id: u64,
    app_state: T,
    game: Arc<Mutex<Scene>>,
}

impl<T: AppStateTrait> GameManager<T> {
    pub async fn new(app_state: T) -> Result<Self> {
        let transaction = app_state.get_db().begin().await?;
        let board_manager = BoardManager::new();
        let board = if let Some(board) = board_manager.find_board_by_id(&transaction, 1).await? {
            board.try_into()?
        } else {
            board_manager
                .create_board(&transaction, Board::default().try_into()?)
                .await?
                .try_into()?
        };

        Ok(Self {
            id: 0,
            game: Arc::new(Mutex::new(Scene::new(board))),
            app_state,
        })
    }

    pub fn get_board(&self) -> Board {
        self.game.lock().unwrap().board.clone()
    }
}
