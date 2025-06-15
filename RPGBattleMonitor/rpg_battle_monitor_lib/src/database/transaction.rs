use std::{fmt::Debug, marker::PhantomData};

use axum::{extract::FromRequestParts, http::request::Parts, response::IntoResponse};
use sqlx::Pool;

use crate::webserver::router::app_state::AppStateTrait;

use super::error::{Error, Result};

pub trait DatabaseMarker: Debug + Send + Sized + 'static {
    type Driver: sqlx::Database;
}

impl<DB: sqlx::Database> DatabaseMarker for Pool<DB> {
    type Driver = DB;
}

#[derive(Debug)]
pub struct Transaction<DB: DatabaseMarker, E = Error> {
    pub db: sqlx::Pool<DB::Driver>,
    transaction: Option<sqlx::Transaction<'static, DB::Driver>>,
    counter: u32,
    _error: PhantomData<E>,
}

impl<DB: DatabaseMarker, E> Transaction<DB, E> {
    pub fn new(db: Pool<DB::Driver>) -> Self {
        Self {
            db,
            transaction: Option::default(),
            counter: 0,
            _error: PhantomData,
        }
    }

    pub async fn begin(&mut self) -> Result<&mut sqlx::Transaction<'static, DB::Driver>> {
        if self.transaction.is_some() {
            self.counter += 1;
        } else {
            let transaction = self.db.begin().await?;
            self.transaction.replace(transaction);
        }

        Ok(self.transaction.as_mut().unwrap())
    }

    pub async fn commit(&mut self) -> Result<()> {
        if let Some(transaction) = self.transaction.take() {
            if self.counter > 1 {
                self.counter -= 1;
                self.transaction.replace(transaction);
            } else {
                transaction.commit().await?;
            }
            Ok(())
        } else {
            Err(Error::NoTransaction)
        }
    }

    pub async fn rollback(&mut self) -> Result<()> {
        if let Some(transaction) = self.transaction.take() {
            if self.counter > 1 {
                self.counter -= 1;
                self.transaction.replace(transaction);
            } else {
                transaction.rollback().await?;
            }
            Ok(())
        } else {
            Err(Error::NoTransaction)
        }
    }
}

impl<DB: DatabaseMarker + sqlx::Database, S, E> FromRequestParts<S> for Transaction<DB, E>
where
    S: AppStateTrait<DB::Driver> + Sync,
    E: From<Error> + IntoResponse + Send,
{
    type Rejection = E;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> core::result::Result<Self, Self::Rejection> {
        let pool: Result<&Pool<DB::Driver>> = parts.extensions.get().ok_or(Error::NoExtension);
        let pool = match pool {
            Ok(p) => p.clone(),
            Err(_) => state.get_db_pool(),
        };

        Ok(Transaction::new(pool))
    }
}
