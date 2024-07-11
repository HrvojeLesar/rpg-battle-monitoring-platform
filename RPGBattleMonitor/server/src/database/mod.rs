#[cfg(all(feature = "db_sqlite", feature = "db_postgres"))]
compile_error!("Please select one database feature, either 'db_sqlite' or 'db_postgres'");

use sqlx::{
    any::{install_drivers, AnyPoolOptions},
    migrate::MigrateDatabase,
    AnyPool,
};

#[allow(clippy::let_and_return)]
pub async fn get_database_pool() -> AnyPool {
    #[cfg(feature = "db_sqlite")]
    install_drivers(&[sqlx::sqlite::any::DRIVER]).expect("Failed to install db drivers");
    #[cfg(feature = "db_postgres")]
    install_drivers(&[sqlx::postgres::any::DRIVER]).expect("Failed to install db drivers");

    let url = dotenvy::var("DATABASE_URL").expect("DATABASE_URL must be set");

    if !sqlx::Any::database_exists(&url)
        .await
        .expect("Database existance check is required")
    {
        tracing::info!("Creating database");
        sqlx::Any::create_database(&url)
            .await
            .expect("Database must be created");
        tracing::info!("Database created");
    }

    #[cfg(debug_assertions)]
    let max_connections = 10;
    #[cfg(not(debug_assertions))]
    let max_connections = 100;

    let pool = AnyPoolOptions::new()
        .max_connections(max_connections)
        .connect(&url)
        .await
        .expect("Pool must be created");

    #[cfg(not(debug_assertions))]
    {
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
    }

    pool
}
