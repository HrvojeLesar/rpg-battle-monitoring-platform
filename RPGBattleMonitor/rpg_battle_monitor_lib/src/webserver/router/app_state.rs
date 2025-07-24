use std::sync::Arc;

use dashmap::DashMap;
use sea_orm::DatabaseConnection;

use crate::{
    cdn::filesystem::{
        Adapter,
        local_adapter::{self, Local},
    },
    config,
    database::get_sea_orm_database,
    game::GameManager,
};

pub struct AppStateConfig<F>
where
    F: Adapter,
{
    pub file_system_handler: F,
    pub database: DatabaseConnection,
}

impl AppStateConfig<local_adapter::Local> {
    pub async fn get_default_config() -> AppStateConfig<local_adapter::Local> {
        Self {
            file_system_handler: Self::get_fs_handler_from_config(),
            database: Self::get_database().await,
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
    fn get_active_games(&self) -> Arc<DashMap<u64, GameManager<Self>>>;
}

#[derive(Debug)]
pub struct AppState<F>
where
    F: Adapter,
{
    pub fs_handler: F,
    pub database: DatabaseConnection,
    pub active_games: Arc<DashMap<u64, GameManager<Self>>>,
}

impl<F> Clone for AppState<F>
where
    F: Adapter,
{
    fn clone(&self) -> Self {
        Self {
            fs_handler: self.fs_handler.clone(),
            database: self.database.clone(),
            active_games: Arc::new(DashMap::new()),
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
            active_games: Arc::new(DashMap::new()),
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

    fn get_active_games(&self) -> Arc<DashMap<u64, GameManager<Self>>> {
        self.active_games.clone()
    }
}
