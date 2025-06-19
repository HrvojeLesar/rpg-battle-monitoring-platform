use crate::cdn::filesystem::Adapter;
use crate::cdn::model::assets::AssetManager;

use crate::webserver::extractors::local_fs_extractor::FSAdapter;
use crate::{
    database::transaction::Transaction,
    webserver::{
        extractors::error::{Error, Result},
        router::app_state::AppStateTrait,
    },
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sea_orm::DatabaseConnection;
impl<S, F> FromRequestParts<S> for AssetManager<F>
where
    S: AppStateTrait<FsHandler = F>,
    F: Adapter,
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
        let transaction = Transaction::new(pool);
        let handler = state.get_fs_handler();

        let fs_adapter = FSAdapter::new(handler);

        Ok(AssetManager::new(transaction, fs_adapter))
    }
}
