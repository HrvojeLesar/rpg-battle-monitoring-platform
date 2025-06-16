use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::Pool;

use crate::{
    database::transaction::{DatabaseMarker, Transaction},
    extractors::error::{Error, Result},
    webserver::router::app_state::AppStateTrait,
};

impl<DB: DatabaseMarker + sqlx::Database, S> FromRequestParts<S> for Transaction<DB>
where
    S: AppStateTrait<DB::Driver> + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let pool: Result<&Pool<DB::Driver>> = parts.extensions.get().ok_or(Error::MissingExtension);
        let pool = match pool {
            Ok(p) => p.clone(),
            Err(_) => state.get_db_pool(),
        };

        Ok(Transaction::new(pool))
    }
}
