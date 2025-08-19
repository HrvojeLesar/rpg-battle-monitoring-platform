use std::sync::Arc;

use sea_orm::DatabaseConnection;
use tokio::sync::Mutex;

use crate::{
    cdn::filesystem::{
        Adapter,
        local_adapter::{self, Local},
    },
    config,
    database::get_sea_orm_database,
    webserver::services::entity_queue::EntityQueue,
};

pub struct AppStateConfig<F>
where
    F: Adapter,
{
    pub file_system_handler: F,
    pub database: DatabaseConnection,
    pub entity_queue: Arc<Mutex<EntityQueue>>,
}

impl AppStateConfig<local_adapter::Local> {
    pub async fn get_default_config() -> AppStateConfig<local_adapter::Local> {
        let database = Self::get_database().await;
        let entity_queue = Arc::new(Mutex::new(EntityQueue::new(database.clone())));
        Self {
            file_system_handler: Self::get_fs_handler_from_config(),
            database,
            entity_queue,
        }
    }

    fn get_fs_handler_from_config() -> local_adapter::Local {
        let config = config::config();
        Local::new(config.assets_base_path.clone().into())
    }

    async fn get_database() -> DatabaseConnection {
        let config = config::config();

        get_sea_orm_database(
            &config.database.database_url,
            config.database.max_connections,
        )
        .await
    }
}

pub trait AppStateTrait: Clone + Send + Sync + 'static {
    type FsHandler: Adapter + 'static;

    fn get_fs_handler(&self) -> Self::FsHandler;
    fn get_db(&self) -> DatabaseConnection;
    fn get_entity_queue(&self) -> Arc<Mutex<EntityQueue>>;
}

#[derive(Debug)]
pub struct AppState<F>
where
    F: Adapter,
{
    pub fs_handler: F,
    pub database: DatabaseConnection,
    pub entity_queue: Arc<Mutex<EntityQueue>>,
}

impl<F> Clone for AppState<F>
where
    F: Adapter,
{
    fn clone(&self) -> Self {
        Self {
            fs_handler: self.fs_handler.clone(),
            database: self.database.clone(),
            entity_queue: self.entity_queue.clone(),
        }
    }
}

impl<F> AppState<F>
where
    F: Adapter,
{
    pub async fn new(config: AppStateConfig<F>) -> Self {
        Self {
            fs_handler: config.file_system_handler,
            database: config.database,
            entity_queue: config.entity_queue,
        }
    }
}

impl<F> AppStateTrait for AppState<F>
where
    F: Adapter,
{
    type FsHandler = F;

    fn get_fs_handler(&self) -> Self::FsHandler {
        self.fs_handler.clone()
    }

    fn get_db(&self) -> DatabaseConnection {
        self.database.clone()
    }

    fn get_entity_queue(&self) -> Arc<Mutex<EntityQueue>> {
        self.entity_queue.clone()
    }
}
