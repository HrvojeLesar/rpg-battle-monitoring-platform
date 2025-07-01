use std::ops::{Deref, DerefMut};

use axum::{extract::FromRequestParts, http::request::Parts};
use sea_orm::DatabaseConnection;

use crate::webserver::{extractors::error::Error, router::app_state::AppStateTrait};

pub struct DbConn(DatabaseConnection);

impl Deref for DbConn {
    type Target = DatabaseConnection;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for DbConn {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl AsRef<DatabaseConnection> for DbConn {
    fn as_ref(&self) -> &DatabaseConnection {
        &self.0
    }
}

impl From<DbConn> for DatabaseConnection {
    fn from(value: DbConn) -> Self {
        value.0
    }
}

impl From<DatabaseConnection> for DbConn {
    fn from(value: DatabaseConnection) -> Self {
        Self(value)
    }
}

impl<S> FromRequestParts<S> for DbConn
where
    S: AppStateTrait,
{
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        Ok(state.get_db().into())
    }
}
