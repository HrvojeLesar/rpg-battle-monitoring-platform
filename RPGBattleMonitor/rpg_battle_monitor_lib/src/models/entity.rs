use sea_orm::entity::prelude::*;
use serde::Serialize;

pub use inner::*;

#[cfg(feature = "api_doc")]
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "entity")]
#[cfg_attr(feature = "api_doc", derive(ToSchema))]
pub struct Model {
    #[sea_orm(primary_key)]
    pub uid: String,
    #[sea_orm(primary_key)]
    pub game: i32,
    pub timestamp: i64,
    pub kind: String,
    pub data: Vec<u8>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

mod inner {

    use sea_orm::ActiveValue::Set;
    use sea_orm::sea_query::{ExprTrait, OnConflict};
    use sea_orm::{ColumnTrait, Condition, ConnectionTrait, EntityTrait, QueryFilter, QueryTrait};

    use crate::models::entity::{ActiveModel, Column, Entity, Model};
    use crate::models::error::{Error, Result};
    use crate::webserver::services::entity_queue::GameIdAndUIdCombo;

    pub type CompressedEntityModel = Model;

    pub struct EntityManager {}

    impl EntityManager {
        pub fn new() -> Self {
            Self {}
        }

        #[tracing::instrument(skip(self, conn))]
        pub async fn save_valid_entities(
            &self,
            conn: &impl ConnectionTrait,
            valid_entities: Vec<CompressedEntityModel>,
        ) -> Result<()> {
            if valid_entities.is_empty() {
                return Ok(());
            }

            let active_models = valid_entities.into_iter().map(|entity| ActiveModel {
                uid: Set(entity.uid),
                game: Set(entity.game),
                timestamp: Set(entity.timestamp),
                kind: Set(entity.kind),
                data: Set(entity.data),
            });

            Entity::insert_many(active_models)
                .on_conflict(
                    OnConflict::columns([Column::Uid, Column::Game])
                        .update_columns([Column::Timestamp, Column::Kind, Column::Data])
                        .to_owned(),
                )
                .exec(conn)
                .await?;

            Ok(())
        }

        #[tracing::instrument(skip(self, conn))]
        pub async fn filter_out_outdated_entities(
            &self,
            conn: &impl ConnectionTrait,
            compressed_entities: Vec<(GameIdAndUIdCombo, CompressedEntityModel)>,
        ) -> Result<Vec<CompressedEntityModel>> {
            let uids = compressed_entities
                .iter()
                .map(|(combo, _)| combo.uid.0.clone())
                .collect::<Vec<_>>();

            let game_ids = compressed_entities
                .iter()
                .map(|(combo, _)| combo.game_id)
                .collect::<Vec<_>>();

            let entities = compressed_entities
                .into_iter()
                .map(|(_, entity)| entity)
                .collect::<Vec<_>>();

            let saved_entities = Entity::find()
                .filter(
                    Condition::all()
                        .add(Column::Uid.is_in(uids))
                        .add(Column::Game.is_in(game_ids)),
                )
                .all(conn)
                .await?;

            let valid_entities = entities
                .iter()
                .filter(|entity| {
                    let saved_entity = saved_entities
                        .iter()
                        .find(|saved_entity| saved_entity.uid == entity.uid);

                    if let Some(saved_entity) = saved_entity {
                        saved_entity.timestamp < entity.timestamp
                    } else {
                        true
                    }
                })
                .cloned()
                .collect::<Vec<_>>();

            Ok(valid_entities)
        }

        pub async fn load_entities(
            &self,
            conn: &impl ConnectionTrait,
            game_id: i32,
        ) -> Result<Vec<CompressedEntityModel>> {
            Ok(Entity::find()
                .filter(Column::Game.eq(game_id))
                .all(conn)
                .await?)
        }
    }
}
