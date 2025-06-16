use axum::{extract::FromRequestParts, http::request::Parts};

use crate::{
    cdn::filesystem::{Adapter, WritableFilesystem},
    webserver::{extractors::error::Error, router::app_state::AppStateTrait},
};

impl<S, F> FromRequestParts<S> for Adapter<F>
where
    S: AppStateTrait<FsHandler = F>,
    F: WritableFilesystem,
{
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let handler = state.get_fs_handler();

        Ok(handler)
    }
}
