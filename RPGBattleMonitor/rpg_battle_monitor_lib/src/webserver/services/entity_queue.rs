use std::iter::{Skip, Take};

use dashmap::DashMap;
use dashmap::iter::Iter;
use sea_orm::{DatabaseConnection, TransactionTrait};
use tokio::task::JoinHandle;

use crate::api::websockets::Action;
use crate::entity::error::{Error, Result};
use crate::entity::{Entity, UId};
use crate::models::entity::{CompressedEntityModel, EntityManager};

pub struct ChunkedEntityQueueIterator<'a> {
    chunk_size: usize,
    taken_count: usize,
    map: &'a EntityQueue,
}

impl<'a> ChunkedEntityQueueIterator<'a> {
    pub fn new(map: &'a EntityQueue, chunk_size: usize) -> Self {
        Self {
            chunk_size,
            taken_count: 0,
            map,
        }
    }
}

impl<'a> Iterator for ChunkedEntityQueueIterator<'a> {
    type Item = Take<Skip<Iter<'a, GameIdAndUIdCombo, CompressedEntityModel>>>;

    fn next(&mut self) -> Option<Self::Item> {
        let item = self
            .map
            .entities
            .iter()
            .skip(self.taken_count)
            .take(self.chunk_size);

        self.taken_count += self.chunk_size;

        Some(item)
    }
}

#[derive(Debug, Hash, Eq, PartialEq)]
pub struct GameIdAndUIdCombo {
    pub game_id: i32,
    pub uid: UId,
}

impl GameIdAndUIdCombo {
    pub fn new(game_id: i32, uid: UId) -> Self {
        Self { game_id, uid }
    }

    pub fn from_entity(entity: &Entity) -> Self {
        GameIdAndUIdCombo::new(entity.game, entity.uid.clone())
    }
}

#[derive(Debug)]
pub struct EntityQueue {
    pub(crate) entities: DashMap<GameIdAndUIdCombo, CompressedEntityModel>,
    db: DatabaseConnection,
}

impl Default for EntityQueue {
    fn default() -> Self {
        Self {
            entities: DashMap::new(),
            db: DatabaseConnection::default(),
        }
    }
}

impl EntityQueue {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            db,
            ..Self::default()
        }
    }

    pub fn push(&mut self, entity: Entity) -> Result<()> {
        let id = GameIdAndUIdCombo::new(entity.game, entity.uid.clone());

        if let Some(existing_entity) = self.entities.get(&id) {
            if existing_entity.timestamp > entity.timestamp.0 {
                return Ok(());
            }
        }

        let comporessed_entity = entity.try_into()?;
        self.entities.insert(id, comporessed_entity);

        Ok(())
    }

    pub fn contains(&self, entity: &Entity) -> bool {
        self.entities
            .contains_key(&GameIdAndUIdCombo::from_entity(entity))
    }

    pub async fn flush(&mut self) -> Option<JoinHandle<()>> {
        if self.entities.is_empty() {
            return None;
        }

        let map = std::mem::take(&mut self.entities);
        let database = self.db.clone();

        let save_task_handle = tokio::spawn(async move {
            struct Accumulator {
                save_entities: Vec<CompressedEntityModel>,
                delete_entities: Vec<CompressedEntityModel>,
            }

            tracing::info!("Flushing EntityQueue");
            let transaction = match database.begin().await {
                Ok(t) => t,
                Err(e) => {
                    tracing::error!("Failed to begin EntityQueue flush transaction: {}", e);
                    return;
                }
            };

            let entity_manager = EntityManager::new();

            let entities = map.into_iter().collect::<Vec<_>>();

            let valid_entities = match entity_manager
                .filter_out_outdated_entities(&transaction, entities)
                .await
            {
                Ok(e) => e,
                Err(e) => {
                    tracing::error!("Failed to filter out outdated entities: {}", e);
                    return;
                }
            };

            let init = Accumulator {
                save_entities: Vec::new(),
                delete_entities: Vec::new(),
            };

            let accumulator = valid_entities.into_iter().fold(init, |mut acc, entity| {
                if let Some(action) = entity.action.as_ref() {
                    if **action == Action::Delete {
                        acc.delete_entities.push(entity);
                    } else {
                        acc.save_entities.push(entity);
                    }
                }
                acc
            });

            let save_entities = accumulator.save_entities;
            let delete_entities = accumulator.delete_entities;

            if let Err(e) = entity_manager
                .save_valid_entities(&transaction, save_entities)
                .await
            {
                tracing::error!("Failed to create/update entities: {}", e);
            }

            if let Err(e) = entity_manager
                .delete_entities(&transaction, delete_entities)
                .await
            {
                tracing::error!("Failed to delete entities: {}", e);
            }

            if let Err(e) = transaction.commit().await {
                tracing::error!("Failed to commit EntityQueue flush transaction: {}", e);
            }
            tracing::info!("Flushed");
        });

        Some(save_task_handle)
    }
}
