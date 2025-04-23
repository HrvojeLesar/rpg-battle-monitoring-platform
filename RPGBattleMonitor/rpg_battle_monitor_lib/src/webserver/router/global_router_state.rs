use std::env;

use sqlx::AnyPool;

use crate::webserver::database::setup::create_database_pool;

#[derive(Debug, Clone)]
pub struct GlobalRouterState {
    connection_pool: AnyPool,
}

impl GlobalRouterState {
    pub async fn new() -> Self {
        let database_url = env::var("DATABASE_URL")
            .map_err(|error| tracing::warn!(error = %error, "DATABASE_URL not set using default"))
            .unwrap_or("sqlite://rpg_battle_monitor.db".into());

        Self {
            connection_pool: create_database_pool(&database_url).await,
        }
    }
}

impl GlobalRouterStateTrait for GlobalRouterState {
    fn get_connection_pool(&self) -> AnyPool {
        self.connection_pool.clone()
    }
}

pub trait GlobalRouterStateTrait
where
    Self: Clone + Send + Sync + 'static,
{
    fn get_connection_pool(&self) -> AnyPool;
}
