use axum::extract::FromRef;

use crate::model::model_manager::ModelManager;

#[derive(Debug, Clone, FromRef)]
pub struct AppState {
    model_manager: ModelManager,
}

impl AppState {
    pub async fn new() -> Self {
        Self {
            model_manager: ModelManager::new()
                .await
                .expect("Failed to initialize ModelManager"),
        }
    }
}
