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

    #[cfg(debug_assertions)]
    let max_connections = 10;
    #[cfg(not(debug_assertions))]
    let max_connections = compile_error!("Add configuration setting for connection count");

    let pool = AnyPoolOptions::new()
        .max_connections(max_connections)
        .connect(database_url)
        .await
        .expect("Pool must be created");

    #[cfg(not(debug_assertions))]
    let pool = run_migrations(pool).await;

    pool
}

#[cfg(not(debug_assertions))]
async fn run_migrations(pool: AnyPool) -> AnyPool {
    tracing::info!("Running pending migrations");
    let mut migration_transaction = pool
        .begin()
        .await
        .expect("Failed starting migration transaction");

    #[cfg(feature = "db_sqlite")]
    sqlx::migrate!("./migrations_sqlite")
        .run(&mut migration_transaction)
        .await
        .expect("Failed running migrations");

    #[cfg(feature = "db_postgres")]
    sqlx::migrate!("./migrations_postgres")
        .run(&mut migration_transaction)
        .await
        .expect("Failed running migrations");

    migration_transaction
        .commit()
        .await
        .expect("Failed committing migrations");
    tracing::info!("Migrations completed");

    pool
}
