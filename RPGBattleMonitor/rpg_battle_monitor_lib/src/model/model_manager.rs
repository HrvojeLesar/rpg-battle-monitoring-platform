use sqlx::AnyPool;

use crate::{config, database::setup::create_database_pool};

use super::error::Result;

#[derive(Debug, Clone)]
pub struct ModelManager {
    pub db: AnyPool,
}

impl ModelManager {
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
