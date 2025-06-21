use axum::Router;
use axum_test::TestServer;
use sea_orm::{Database, DatabaseConnection};

use crate::{
    cdn::filesystem::local_adapter::Local,
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

async fn create_test_database() -> DatabaseConnection {
    const URL: &str = "sqlite::memory:";
    create_database(URL).await;

    let db = Database::connect(URL).await.unwrap();

    let mut pool = db.get_sqlite_connection_pool().clone();
    run_migrations(&mut pool).await;

    db
}

impl AppStateConfig<Local> {
    pub async fn get_test_config() -> AppStateConfig<Local> {
        Self {
            file_system_handler: Local::new("./test-assets".into()),
            database: create_test_database().await,
        }
    }
}
