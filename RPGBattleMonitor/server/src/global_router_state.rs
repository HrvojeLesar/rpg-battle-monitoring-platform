use sqlx::AnyPool;

#[derive(Debug, Clone)]
pub struct GlobalRouterState {
    connection_pool: AnyPool,
}

impl GlobalRouterState {
    pub async fn new() -> Self {
        Self {
            connection_pool: super::database::get_database_pool().await,
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
