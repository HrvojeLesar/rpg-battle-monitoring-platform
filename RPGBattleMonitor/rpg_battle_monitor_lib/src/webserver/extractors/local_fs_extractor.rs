use std::ops::Deref;

use axum::{extract::FromRequestParts, http::request::Parts};

use crate::{
    cdn::filesystem::Adapter,
    webserver::{extractors::error::Error, router::app_state::AppStateTrait},
};

#[derive(Debug, Clone)]
pub struct FSAdapter<F: Adapter>(F);
impl<F: Adapter> FSAdapter<F> {
    pub fn new(adapter: F) -> Self {
        Self(adapter)
    }
}

impl<F: Adapter> Deref for FSAdapter<F> {
    type Target = F;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<S, F> FromRequestParts<S> for FSAdapter<F>
where
    F: Adapter,
    S: AppStateTrait<FsHandler = F>,
{
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let handler = state.get_fs_handler();

        Ok(FSAdapter::new(handler))
    }
}
