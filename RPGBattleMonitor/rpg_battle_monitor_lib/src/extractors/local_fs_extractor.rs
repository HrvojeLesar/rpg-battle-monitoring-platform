use axum::{extract::FromRequestParts, http::request::Parts};

use crate::{
    cdn::filesystem::{Adapter, local_adapter::Local},
    extractors::error::Error,
    webserver::router::app_state::AppStateTrait,
};

impl<S> FromRequestParts<S> for Adapter<Local>
where
    S: AppStateTrait + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let handler = state.get_fs_handler();

        Ok(Adapter(handler))
    }
}
