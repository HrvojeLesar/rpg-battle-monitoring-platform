use crate::{
    cdn::filesystem::{
        Adapter,
        local_adapter::{self, Local},
    },
    config,
    database::setup::create_database_pool,
};

pub struct AppStateConfig<DB, F>
where
    DB: sqlx::Database,
    F: Adapter,
{
    pub pool: sqlx::Pool<DB>,
    pub file_system_handler: F,
}

impl<DB> AppStateConfig<DB, local_adapter::Local>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub async fn get_default_config() -> AppStateConfig<DB, local_adapter::Local> {
        Self {
            pool: Self::get_pool_from_config().await,
            file_system_handler: Self::get_fs_handler_from_config(),
        }
    }

    async fn get_pool_from_config() -> sqlx::Pool<DB> {
        let config = config::config();

        create_database_pool(
            &config.database.database_url,
            config.database.max_connections,
        )
        .await
    }

    fn get_fs_handler_from_config() -> local_adapter::Local {
        let config = config::config();
        Local::new(config.assets_base_path.clone().into())
    }
}

pub trait AppStateTrait: Clone + Send + Sync + 'static {
    type Database: sqlx::Database;
    type FsHandler: Adapter + 'static;

    fn get_db_pool(&self) -> sqlx::Pool<Self::Database>;
    fn get_fs_handler(&self) -> Self::FsHandler;
}

#[derive(Debug)]
pub struct AppState<DB, F>
where
    DB: sqlx::Database,
    F: Adapter,
{
    pub pool: sqlx::Pool<DB>,
    pub fs_handler: F,
}

impl<DB, F> Clone for AppState<DB, F>
where
    DB: sqlx::Database,
    F: Adapter,
{
    fn clone(&self) -> Self {
        Self {
            pool: self.pool.clone(),
            fs_handler: self.fs_handler.clone(),
        }
    }
}

impl<DB, F> AppState<DB, F>
where
    DB: sqlx::Database,
    F: Adapter,
{
    pub async fn new(config: AppStateConfig<DB, F>) -> Self {
        Self {
            pool: config.pool,
            fs_handler: config.file_system_handler,
        }
    }
}

impl<DB, F> AppStateTrait for AppState<DB, F>
where
    DB: sqlx::Database,
    F: Adapter,
{
    type Database = DB;
    type FsHandler = F;

    fn get_db_pool(&self) -> sqlx::Pool<Self::Database> {
        self.pool.clone()
    }

    fn get_fs_handler(&self) -> Self::FsHandler {
        self.fs_handler.clone()
    }
}
