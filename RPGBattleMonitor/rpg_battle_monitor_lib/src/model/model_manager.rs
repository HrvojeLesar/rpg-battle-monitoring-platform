use sqlx::Pool;

use crate::{config, database::setup::create_database_pool};

use super::error::Result;

#[derive(Debug, Clone)]
pub struct ModelManager<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub db: Pool<DB>,
}

impl<DB: sqlx::Database> ModelManager<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub async fn new() -> Result<Self> {
        let config = config::config();
        let db = create_database_pool(
            &config.database.database_url,
            config.database.max_connections,
        )
        .await;

        Ok(Self { db })
    }
}
