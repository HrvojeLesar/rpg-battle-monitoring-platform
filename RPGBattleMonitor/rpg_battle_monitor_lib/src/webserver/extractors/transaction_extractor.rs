use axum::{extract::FromRequestParts, http::request::Parts};

use crate::{
    database::transaction::Transaction,
    webserver::{
        extractors::error::{Error, Result},
        router::app_state::AppStateTrait,
    },
};

impl<DB: sqlx::Database, S> FromRequestParts<S> for Transaction<DB>
where
    S: AppStateTrait<Database = DB>,
{
    type Rejection = Error;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let pool: Result<&sqlx::Pool<DB>> = parts.extensions.get().ok_or(Error::MissingExtension);

        let pool = match pool {
            Ok(p) => p.clone(),
            Err(_) => state.get_db_pool(),
        };

        Ok(Transaction::new(pool))
    }
}
