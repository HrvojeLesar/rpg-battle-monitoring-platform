use std::sync::Arc;

use sea_orm::entity::prelude::*;
use serde::Serialize;

pub use inner::*;

use crate::api::websockets::Action;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "entity")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub uid: String,
    #[sea_orm(primary_key)]
    pub game: i32,
    pub timestamp: i64,
    pub kind: String,
    pub data: Vec<u8>,
    #[sea_orm(ignore)]
    pub action: Option<Arc<Action>>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

mod inner {

    use sea_orm::ActiveValue::Set;
    use sea_orm::sea_query::OnConflict;
    use sea_orm::{ColumnTrait, Condition, ConnectionTrait, EntityTrait, QueryFilter};

    use crate::models::entity::{ActiveModel, Column, Entity, Model};
    use crate::models::error::{Error, Result};
    use crate::webserver::services::entity_queue::GameIdAndUIdCombo;

    pub type CompressedEntityModel = Model;

    pub struct EntityManager {}

    impl EntityManager {
        pub fn new() -> Self {
            Self {}
        }

        #[tracing::instrument(skip(self, conn, valid_entities))]
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

        #[tracing::instrument(skip(self, conn, compressed_entities))]
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
                    if entity.action.is_none()
                        || entity
                            .action
                            .as_ref()
                            .expect("Action is not none")
                            .is_other()
                    {
                        return false;
                    }

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

        #[tracing::instrument(skip(self, conn))]
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

        #[tracing::instrument(skip(self, conn))]
        pub(crate) async fn delete_entities(
            &self,
            conn: &impl ConnectionTrait,
            delete_entities: Vec<CompressedEntityModel>,
        ) -> Result<()> {
            if delete_entities.is_empty() {
                return Ok(());
            }

            let deletes = delete_entities.into_iter().map(|entity| {
                Entity::delete(ActiveModel {
                    uid: Set(entity.uid),
                    game: Set(entity.game),
                    ..Default::default()
                })
            });

            for delete in deletes {
                delete.exec(conn).await?;
            }

            Ok(())
        }
    }
}
