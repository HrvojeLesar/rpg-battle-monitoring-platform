use crate::cdn::filesystem::Adapter;
use crate::models::assets::AssetManager;

use crate::webserver::extractors::local_fs_extractor::FSAdapter;
use crate::webserver::{extractors::error::Error, router::app_state::AppStateTrait};
use axum::{extract::FromRequestParts, http::request::Parts};
impl<S, F> FromRequestParts<S> for AssetManager<F>
where
    S: AppStateTrait<FsHandler = F>,
    F: Adapter,
{
    type Rejection = Error;
    async fn from_request_parts(
        _parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let fs_adapter = FSAdapter::new(state.get_fs_handler());

        Ok(AssetManager::new(fs_adapter))
    }
}

#[cfg(test)]
impl<T, F> From<T> for AssetManager<F>
where
    T: AppStateTrait<FsHandler = F>,
    F: Adapter,
{
    fn from(state: T) -> Self {
        let fs_adapter = FSAdapter::new(state.get_fs_handler());

        AssetManager::new(fs_adapter)
    }
}
