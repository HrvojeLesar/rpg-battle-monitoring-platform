use std::env;

use sqlx::{
    AnyPool,
    any::{AnyPoolOptions, install_drivers},
    migrate::MigrateDatabase,
};

#[cfg(all(feature = "db_sqlite", feature = "db_postgres"))]
compile_error!("Please select one database feature, either 'db_sqlite' or 'db_postgres'");

#[tracing::instrument]
pub async fn create_database_pool(database_url: &str) -> AnyPool {
    #[cfg(feature = "db_sqlite")]
    install_drivers(&[sqlx::sqlite::any::DRIVER]).expect("Failed to install db drivers");
    #[cfg(feature = "db_postgres")]
    install_drivers(&[sqlx::postgres::any::DRIVER]).expect("Failed to install db drivers");

    if !sqlx::Any::database_exists(database_url)
        .await
        .expect("Cannot verify if database exists")
    {
        tracing::info!("Starting database creation");

        sqlx::Any::create_database(database_url)
            .await
            .expect("Failed to create database");

        tracing::info!("Database successfully created");
    }

    let max_connections = env::var("DATABASE_CONNECTIONS")
        .map_err(|error| {
            tracing::warn!(error = %error, "DATABASE_CONNECTIONS not found using default");
            error
        })
        .ok()
        .and_then(|max| {
            max.parse::<u32>()
                .map_err(|error| {
                    tracing::warn!(error = %error, "Failed to parse DATABASE_CONNECTIONS into a number, using default");
                    error
                })
                .ok()
        })
        .unwrap_or(10);

    let mut pool = AnyPoolOptions::new()
        .max_connections(max_connections)
        .connect(database_url)
        .await
        .expect("Pool must be created");

    run_migrations(&mut pool).await;

    pool
}

async fn run_migrations(pool: &mut AnyPool) {
    tracing::info!("Running pending migrations");
    let mut migration_transaction = pool
        .begin()
        .await
        .expect("Failed starting migration transaction");

    #[cfg(feature = "db_sqlite")]
    sqlx::migrate!("./migrations/sqlite")
        .run(&mut migration_transaction)
        .await
        .expect("Failed running migrations");

    #[cfg(feature = "db_postgres")]
    sqlx::migrate!("./migrations/postgres")
        .run(&mut migration_transaction)
        .await
        .expect("Failed running migrations");

    migration_transaction
        .commit()
        .await
        .expect("Failed committing migrations");
    tracing::info!("Migrations completed");
}
