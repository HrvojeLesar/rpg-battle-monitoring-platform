use std::iter::{Skip, Take};

use dashmap::DashMap;
use dashmap::iter::Iter;
use sea_orm::{DatabaseConnection, TransactionTrait};

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

    pub async fn flush(&mut self) {
        if self.entities.is_empty() {
            return;
        }

        let map = std::mem::take(&mut self.entities);
        let database = self.db.clone();

        tokio::spawn(async move {
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

            if let Err(e) = entity_manager
                .save_valid_entities(&transaction, valid_entities)
                .await
            {
                tracing::error!("Failed to insert entities: {}", e);
            }

            if let Err(e) = transaction.commit().await {
                tracing::error!("Failed to commit EntityQueue flush transaction: {}", e);
            }
            tracing::info!("Flushed");
        });
    }
}
