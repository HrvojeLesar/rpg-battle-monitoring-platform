use std::sync::OnceLock;

use sqlx::{Connection, any::install_drivers, migrate::MigrateDatabase};
use url::Url;

#[cfg(all(feature = "db_sqlite", feature = "db_postgres"))]
compile_error!("Please select one database feature, either 'db_sqlite' or 'db_postgres'");

static DRIVERS_INSTALLED: OnceLock<()> = OnceLock::new();

#[tracing::instrument]
pub async fn create_database_pool<DB>(database_url: &str, max_connections: u32) -> sqlx::Pool<DB>
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    create_database(database_url).await;

    let mut pool = sqlx::pool::PoolOptions::new()
        .max_connections(max_connections)
        .connect_with(connect_options::<DB>(database_url))
        .await
        .expect("Pool must be created");

    run_migrations(&mut pool).await;

    pool
}

pub async fn create_database(database_url: &str) {
    DRIVERS_INSTALLED.get_or_init(|| {
        #[cfg(feature = "db_sqlite")]
        install_drivers(&[sqlx::sqlite::any::DRIVER]).expect("Failed to install db drivers");
        #[cfg(feature = "db_postgres")]
        install_drivers(&[sqlx::postgres::any::DRIVER]).expect("Failed to install db drivers");
    });

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
}

#[tracing::instrument]
pub async fn run_migrations<DB>(pool: &mut sqlx::Pool<DB>)
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

/// # Safety
/// Does not start a transaction
#[tracing::instrument]
pub async unsafe fn run_migrations_no_transaction<DB>(pool: &sqlx::Pool<DB>)
where
    DB: sqlx::Database,
    <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
{
    tracing::info!("Running pending migrations");
    #[cfg(feature = "db_sqlite")]
    sqlx::migrate!("./migrations/sqlite")
        .run(pool)
        .await
        .expect("Failed running migrations");

    #[cfg(feature = "db_postgres")]
    sqlx::migrate!("./migrations/postgres")
        .run(pool)
        .await
        .expect("Failed running migrations");
    tracing::info!("Migrations completed");
}

trait IntoSqlxConnectOptions: Sized {
    type Database: sqlx::Database;

    fn into_options(
        self,
    ) -> <<Self::Database as sqlx::Database>::Connection as sqlx::Connection>::Options;
}
struct CustomConnectOptions<T> {
    options: T,
}

impl<T> IntoSqlxConnectOptions for CustomConnectOptions<T>
where
    T: sqlx::ConnectOptions,
{
    type Database = <<T as sqlx::ConnectOptions>::Connection as sqlx::Connection>::Database;

    fn into_options(
        self,
    ) -> <<Self::Database as sqlx::Database>::Connection as sqlx::Connection>::Options {
        let mut opt = self.options;

        #[cfg(feature = "db_sqlite")]
        {
            let value_any = &mut opt as &mut dyn std::any::Any;
            if let Some(sqlite_options) =
                value_any.downcast_mut::<sqlx::sqlite::SqliteConnectOptions>()
            {
                // TODO: Credit to https://briandouglas.ie/sqlite-defaults/
                let options = sqlite_options
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

                let _ = std::mem::replace(sqlite_options, options);
            }
        }

        opt
    }
}

fn connect_options<DB>(url: &str) -> <DB::Connection as sqlx::Connection>::Options
where
    DB: sqlx::Database,
{
    let default_options: <<DB as sqlx::Database>::Connection as Connection>::Options =
        sqlx::ConnectOptions::from_url(
            &Url::parse(url).expect("Failed to parse database connection url"),
        )
        .expect("Failed to create default connect options");

    let custom_options = CustomConnectOptions {
        options: default_options,
    };

    custom_options.into_options()
}
