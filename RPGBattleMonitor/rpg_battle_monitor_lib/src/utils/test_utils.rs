use std::sync::Arc;

use axum::Router;
use axum_test::TestServer;
use sea_orm::{Database, DatabaseConnection};
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::{
    cdn::filesystem::temp_file_adapter::TempFileStore,
    database::setup::{create_database, run_migrations},
    webserver::{
        router::app_state::{AppState, AppStateConfig},
        services::entity_queue::EntityQueue,
    },
};

pub(crate) const TEST_IMAGE_BYTES: &[u8] = include_bytes!("../../tests/assets/WIP.png");
pub(crate) const TEST_PDF_BYTES: &[u8] = include_bytes!("../../tests/assets/test.pdf");

pub(crate) fn new_test_app(router: Router) -> TestServer {
    TestServer::builder()
        .expect_success_by_default()
        .http_transport()
        .build(router)
        .unwrap()
}

pub(crate) fn get_random_filename() -> String {
    format!("test-file-{}.jpg", Uuid::new_v4())
}

pub(crate) async fn get_app_state_with_temp_file_store() -> AppState<TempFileStore> {
    AppState::new(AppStateConfig::get_test_config().await).await
}

async fn create_test_database() -> DatabaseConnection {
    const URL: &str = "sqlite::memory:";
    create_database(URL).await;

    let db = Database::connect(URL).await.unwrap();

    let mut pool = db.get_sqlite_connection_pool().clone();
    run_migrations(&mut pool).await;

    db
}

impl AppStateConfig<TempFileStore> {
    pub async fn get_test_config() -> AppStateConfig<TempFileStore> {
        let database = create_test_database().await;
        Self {
            file_system_handler: TempFileStore::new(),
            database: database.clone(),
            entity_queue: Arc::new(Mutex::new(EntityQueue::new(database))),
        }
    }
}
