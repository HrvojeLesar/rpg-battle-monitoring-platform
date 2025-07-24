use sea_orm::entity::prelude::*;
use serde::Serialize;

pub use inner::*;

#[cfg(feature = "api_doc")]
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "board")]
#[cfg_attr(feature = "api_doc", derive(ToSchema))]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub grid: String,
    pub width: i32,
    pub height: i32,
    pub cell_size: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

mod inner {
    use sea_orm::{
        ActiveModelTrait,
        ActiveValue::{NotSet, Set},
        ColumnTrait, ConnectionTrait, EntityTrait, QueryFilter, TryIntoModel,
        sea_query::ValueType,
    };

    use crate::models::board::{ActiveModel, Column, Entity, Model};

    use crate::models::error::{Error, Result};

    pub type Board = Model;

    pub struct BoardManager {}

    impl BoardManager {
        pub fn new() -> Self {
            Self {}
        }

        #[tracing::instrument(skip(self, conn))]
        pub async fn create_board(
            &self,
            conn: &impl ConnectionTrait,
            board: Board,
        ) -> Result<Board> {
            let board_active_model = ActiveModel {
                id: NotSet,
                grid: Set(board.grid),
                width: Set(board.width),
                height: Set(board.height),
                cell_size: Set(board.cell_size),
            };

            Ok(board_active_model.insert(conn).await?)
        }

        pub async fn find_board_by_id(
            &self,
            conn: &impl ConnectionTrait,
            id: i32,
        ) -> Result<Option<Board>> {
            Ok(Entity::find().filter(Column::Id.eq(id)).one(conn).await?)
        }

        pub async fn update_board(
            &self,
            conn: &impl ConnectionTrait,
            board: Board,
        ) -> Result<Board> {
            let board_active_model = ActiveModel {
                id: Set(board.id),
                grid: Set(board.grid),
                width: Set(board.width),
                height: Set(board.height),
                cell_size: Set(board.cell_size),
            };

            Ok(board_active_model.update(conn).await?)
        }
    }
}
