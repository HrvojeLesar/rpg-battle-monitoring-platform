use axum::{extract::FromRequestParts, http::request::Parts};
use sea_orm::DatabaseConnection;

use crate::{
    database::transaction::Transaction,
    webserver::{
        extractors::error::{Error, Result},
        router::app_state::AppStateTrait,
    },
};

impl<S> FromRequestParts<S> for Transaction
where
    S: AppStateTrait,
{
    type Rejection = Error;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let pool: Result<&DatabaseConnection> =
            parts.extensions.get().ok_or(Error::MissingExtension);

        let pool = match pool {
            Ok(p) => p.clone(),
            Err(_) => state.get_db(),
        };

        Ok(Transaction::new(pool))
    }
}
