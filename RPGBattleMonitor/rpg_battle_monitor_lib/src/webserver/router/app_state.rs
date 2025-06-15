use axum::extract::FromRef;

use crate::{config, database::setup::create_database_pool};

#[derive(Debug, Clone)]
pub struct AppState<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub pool: sqlx::Pool<DB>,
}

impl<DB> AppState<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub async fn new() -> Self {
        Self {
            pool: Self::get_pool_from_config().await,
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
}

pub trait AppStateTrait<DB>
where
    Self: Send + Sync + 'static,
    DB: sqlx::Database,
{
    fn get_db_pool(&self) -> sqlx::Pool<DB>;
}

impl<DB> AppStateTrait<DB> for AppState<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    fn get_db_pool(&self) -> sqlx::Pool<DB> {
        self.pool.clone()
    }
}

impl<DB> FromRef<AppState<DB>> for sqlx::Pool<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    fn from_ref(input: &AppState<DB>) -> Self {
        input.pool.clone()
    }
}
