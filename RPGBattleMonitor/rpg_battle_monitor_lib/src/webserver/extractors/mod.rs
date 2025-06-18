pub mod asset_extractor;
pub mod error;
pub mod local_fs_extractor;
pub mod transaction_extractor;

#[macro_export]
macro_rules! implement_manager_from_request {
    ($type:ident) => {
        use axum::{extract::FromRequestParts, http::request::Parts};

        use $crate::{
            database::transaction::Transaction,
            webserver::{
                extractors::error::{Error, Result},
                router::app_state::AppStateTrait,
            },
        };

        impl<S> FromRequestParts<S> for $type
        where
            S: AppStateTrait<Database = sqlx::Any>,
        {
            type Rejection = Error;

            async fn from_request_parts(
                parts: &mut Parts,
                state: &S,
            ) -> core::result::Result<Self, Self::Rejection> {
                let pool: Result<&sqlx::Pool<sqlx::Any>> =
                    parts.extensions.get().ok_or(Error::MissingExtension);

                let pool = match pool {
                    Ok(p) => p.clone(),
                    Err(_) => state.get_db_pool(),
                };

                let transaction = Transaction::new(pool);

                Ok(AssetManager::new(transaction))
            }
        }
    };
}
