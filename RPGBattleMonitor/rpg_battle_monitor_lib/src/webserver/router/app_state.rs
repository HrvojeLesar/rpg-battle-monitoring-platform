use axum::extract::FromRef;

use crate::model::model_manager::ModelManager;

#[derive(Debug, Clone)]
pub struct AppState<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub model_manager: ModelManager<DB>,
}

impl<DB> AppState<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    pub async fn new() -> Self {
        Self {
            model_manager: ModelManager::new()
                .await
                .expect("Failed to initialize ModelManager"),
        }
    }
}

pub trait AppStateTrait<DB>
where
    Self: Clone + Send + Sync + 'static,
    DB: sqlx::Database,
{
    fn get_db_pool(&self) -> sqlx::Pool<DB>;
}

impl<DB> AppStateTrait<DB> for AppState<DB>
where
    DB: sqlx::Database + Clone,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    fn get_db_pool(&self) -> sqlx::Pool<DB> {
        self.model_manager.db.clone()
    }
}

impl<DB> FromRef<AppState<DB>> for ModelManager<DB>
where
    DB: sqlx::Database + Clone,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    fn from_ref(input: &AppState<DB>) -> Self {
        input.model_manager.clone()
    }
}

impl<DB> FromRef<AppState<DB>> for sqlx::Pool<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    fn from_ref(input: &AppState<DB>) -> Self {
        input.model_manager.db.clone()
    }
}
