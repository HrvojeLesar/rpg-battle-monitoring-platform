use std::sync::Arc;

use axum::extract::FromRef;

use crate::{
    cdn::filesystem::{
        Adapter, FileSystem, Writeable,
        local_adapter::{self, Local},
    },
    config,
    database::setup::create_database_pool,
};

pub struct AppStateConfig<DB, F>
where
    DB: sqlx::Database,
    F: FileSystem + Writeable,
{
    pub pool: sqlx::Pool<DB>,
    pub file_system_handler: Adapter<F>,
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

    fn get_fs_handler_from_config() -> Adapter<local_adapter::Local> {
        let config = config::config();
        Adapter(Arc::new(Local::new(config.assets_base_path.clone().into())))
    }
}

#[derive(Debug, Clone)]
pub struct AppState<DB, F>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
    F: FileSystem + Writeable,
{
    pub pool: sqlx::Pool<DB>,
    pub file_system_handler: Adapter<F>,
}

impl<DB, F> AppState<DB, F>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
    F: FileSystem + Writeable,
{
    pub async fn new(config: AppStateConfig<DB, F>) -> Self {
        Self {
            pool: config.pool,
            file_system_handler: config.file_system_handler,
        }
    }
}

pub trait AppStateTrait<DB = sqlx::Sqlite, F = Local>
where
    Self: Send + Sync + 'static,
    DB: sqlx::Database,
    F: FileSystem + Writeable,
{
    fn get_db_pool(&self) -> sqlx::Pool<DB>;
    fn get_fs_handler(&self) -> Arc<F>;
}

impl<DB, F> AppStateTrait<DB, F> for AppState<DB, F>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
    F: FileSystem + Writeable + Send + Sync + 'static,
{
    fn get_db_pool(&self) -> sqlx::Pool<DB> {
        self.pool.clone()
    }
    fn get_fs_handler(&self) -> Arc<F> {
        todo!()
    }
}

impl<DB, F> FromRef<AppState<DB, F>> for sqlx::Pool<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
    F: FileSystem + Writeable + Send + Sync + 'static,
{
    fn from_ref(input: &AppState<DB, F>) -> Self {
        input.pool.clone()
    }
}
