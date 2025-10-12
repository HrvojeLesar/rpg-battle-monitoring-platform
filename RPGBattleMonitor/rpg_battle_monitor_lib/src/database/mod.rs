use sea_orm::{ConnectOptions, Database};

use crate::database::setup::create_database;

pub mod error;
pub mod setup;

pub async fn get_sea_orm_database(url: &str, max_connections: u32) -> sea_orm::DatabaseConnection {
    create_database(url).await;

    let mut connect_options = ConnectOptions::new(url);
    connect_options
        .connect_lazy(true)
        .max_connections(max_connections);

    let db = Database::connect(connect_options)
        .await
        .expect("Failed to create database connection");

    #[cfg(feature = "db_sqlite")]
    {
        use sea_orm::ConnectionTrait;

        let backend = db.get_database_backend();
        if let sea_orm::DatabaseBackend::Sqlite = backend {
            use crate::database::setup::run_migrations_no_transaction;

            let pool = db.get_sqlite_connection_pool().clone();

            // TODO: Credit to https://briandouglas.ie/sqlite-defaults/
            let connect_options = (*pool.connect_options())
                .clone()
                .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
                .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
                .busy_timeout(std::time::Duration::from_secs(5))
                .pragma("cache_size", "-20000")
                .foreign_keys(true)
                .auto_vacuum(sqlx::sqlite::SqliteAutoVacuum::Incremental)
                .pragma("temp_store", "MEMORY")
                .pragma("mmap_size", "2147483648")
                .page_size(8192);
            pool.set_connect_options(connect_options);

            unsafe {
                run_migrations_no_transaction(&pool).await;
            }
        }
    }

    db
}
