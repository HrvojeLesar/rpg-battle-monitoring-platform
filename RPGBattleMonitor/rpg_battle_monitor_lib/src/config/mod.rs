pub use error::{Error, Result};
use std::{env, sync::OnceLock};

pub mod error;

pub struct DatabaseConfig {
    pub database_url: String,
    pub max_connections: u32,
}

pub struct Config {
    pub database: DatabaseConfig,
}

impl Config {
    pub fn load_from_env() -> Result<Self> {
        Ok(Self {
            database: DatabaseConfig::load_from_env()?,
        })
    }
}

impl DatabaseConfig {
    const DEFAULT_MAX_CONNECTIONS: u32 = 10;

    fn load_from_env() -> Result<Self> {
        Ok(Self {
            database_url: Self::load_database_url()?,
            max_connections: Self::parse_max_connections().unwrap_or(Self::DEFAULT_MAX_CONNECTIONS),
        })
    }

    fn parse_max_connections() -> Result<u32> {
        env::var("DATABASE_CONNECTIONS")
            .map_err(|error| {
                let error = Error::MaxConnectionsNotSet(error);
                tracing::warn!(error = %error, "DATABASE_CONNECTIONS not found using default");

                error
            })
            .and_then( |max| {
                max.parse::<u32>()
                    .map_err(|error| {
                        let error = Error::ParseIntError(error);
                        tracing::warn!(error = %error, "Failed to parse DATABASE_CONNECTIONS into a number, using default");
                        error
                    })
            })
    }

    fn load_database_url() -> Result<String> {
        env::var("DATABASE_URL").map_err(|_| Error::EnvMissingDatabaseUrl)
    }
}

pub fn config() -> &'static Config {
    static INSTANCE: OnceLock<Config> = OnceLock::new();

    INSTANCE.get_or_init(|| Config::load_from_env().unwrap_or_else(|err| panic!("{err}")))
}
