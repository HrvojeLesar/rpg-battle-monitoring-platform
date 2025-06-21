use axum::Router;
use axum_test::TestServer;
use sea_orm::{Database, DatabaseConnection};
use uuid::Uuid;

use crate::{
    cdn::filesystem::temp_file_adapter::TempFileStore,
    database::setup::{create_database, run_migrations},
    webserver::router::app_state::AppStateConfig,
};

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
        Self {
            file_system_handler: TempFileStore::new(),
            database: create_test_database().await,
        }
    }
}
