use sea_orm::entity::prelude::*;
use serde::Serialize;

pub use inner::*;

#[cfg(feature = "api_doc")]
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "game")]
#[cfg_attr(feature = "api_doc", derive(ToSchema))]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub system: String,
    pub name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

mod inner {
    use crate::models::error::{Error, Result};
    use crate::models::game::{ActiveModel, Column, Entity, Model};
    use sea_orm::ActiveValue::{NotSet, Set};
    use sea_orm::entity::prelude::*;

    pub type GameModel = Model;

    pub struct GameManager {}

    impl GameManager {
        pub fn new() -> Self {
            Self {}
        }

        pub async fn list_games(&self, conn: &impl ConnectionTrait) -> Result<Vec<GameModel>> {
            Ok(Entity::find().all(conn).await?)
        }

        pub async fn create_game(&self, conn: &impl ConnectionTrait) -> Result<GameModel> {
            Ok(ActiveModel {
                id: NotSet,
                system: Set("".to_string()),
                name: Set("test-game".to_string()),
            }
            .insert(conn)
            .await?)
        }
    }
}

#[cfg(test)]
mod test {
    use sea_orm::TransactionTrait;

    use crate::{
        models::game::GameManager, utils::test_utils::get_app_state_with_temp_file_store,
        webserver::router::app_state::AppStateTrait,
    };

    #[tokio::test]
    async fn list_games() {
        let state = get_app_state_with_temp_file_store().await;
        let transaction = state.get_db().begin().await.unwrap();

        let game_manager = GameManager::new();
        let game1 = game_manager.create_game(&transaction).await.unwrap();
        let game2 = game_manager.create_game(&transaction).await.unwrap();

        let games = game_manager.list_games(&transaction).await.unwrap();

        transaction.commit().await.unwrap();
        assert!(games.contains(&game1));
        assert!(games.contains(&game2));
    }

    #[tokio::test]
    async fn create_game() {
        let state = get_app_state_with_temp_file_store().await;
        let transaction = state.get_db().begin().await.unwrap();

        let game_manager = GameManager::new();
        game_manager.create_game(&transaction).await.unwrap();
    }
}
