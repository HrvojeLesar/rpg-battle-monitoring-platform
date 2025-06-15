use sqlx::{any::install_drivers, migrate::MigrateDatabase};

#[cfg(all(feature = "db_sqlite", feature = "db_postgres"))]
compile_error!("Please select one database feature, either 'db_sqlite' or 'db_postgres'");

#[tracing::instrument]
pub async fn create_database_pool<DB>(database_url: &str, max_connections: u32) -> sqlx::Pool<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
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

    let mut pool = sqlx::pool::PoolOptions::new()
        .max_connections(max_connections)
        .connect(database_url)
        .await
        .expect("Pool must be created");

    run_migrations(&mut pool).await;

    pool
}

async fn run_migrations<DB>(pool: &mut sqlx::Pool<DB>)
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
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
