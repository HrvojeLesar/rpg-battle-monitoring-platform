use std::fmt::Debug;

use sqlx::Pool;

use super::error::{Error, Result};

#[derive(Debug)]
pub struct Transaction<DB: sqlx::Database> {
    pub db: sqlx::Pool<DB>,
    transaction: Option<sqlx::Transaction<'static, DB>>,
    counter: u32,
}

impl<DB: sqlx::Database> Transaction<DB> {
    pub fn new(db: Pool<DB>) -> Self {
        Self {
            db,
            transaction: Option::default(),
            counter: 0,
        }
    }

    pub async fn begin(&mut self) -> Result<&mut Self> {
        if self.transaction.is_some() {
            self.counter += 1;
        } else {
            let transaction = self.db.begin().await?;
            self.transaction.replace(transaction);
        }

        Ok(self)
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

impl<'c, DB> sqlx::Executor<'c> for &'c mut Transaction<DB>
where
    DB: sqlx::Database,
    for<'t> &'t mut <DB as sqlx::Database>::Connection: sqlx::Executor<'t, Database = DB>,
{
    type Database = DB;

    fn fetch_many<'e, 'q: 'e, E>(
        self,
        query: E,
    ) -> futures_util::stream::BoxStream<
        'e,
        std::result::Result<
            sqlx::Either<
                <Self::Database as sqlx::Database>::QueryResult,
                <Self::Database as sqlx::Database>::Row,
            >,
            sqlx::Error,
        >,
    >
    where
        'c: 'e,
        E: 'q + sqlx::Execute<'q, Self::Database>,
    {
        if let Some(transaction) = self.transaction.as_mut() {
            (&mut **transaction).fetch_many(query)
        } else {
            tracing::warn!(
                "Transaction executor `fetch_many` function is running without an active transaction"
            );
            self.db.fetch_many(query)
        }
    }

    fn fetch_optional<'e, 'q: 'e, E>(
        self,
        query: E,
    ) -> futures_util::future::BoxFuture<
        'e,
        std::result::Result<Option<<Self::Database as sqlx::Database>::Row>, sqlx::Error>,
    >
    where
        'c: 'e,
        E: 'q + sqlx::Execute<'q, Self::Database>,
    {
        if let Some(transaction) = self.transaction.as_mut() {
            (&mut **transaction).fetch_optional(query)
        } else {
            tracing::warn!(
                "Transaction executor `fetch_optional` function is running without an active transaction"
            );
            self.db.fetch_optional(query)
        }
    }

    fn prepare_with<'e, 'q: 'e>(
        self,
        sql: &'q str,
        parameters: &'e [<Self::Database as sqlx::Database>::TypeInfo],
    ) -> futures_util::future::BoxFuture<
        'e,
        std::result::Result<<Self::Database as sqlx::Database>::Statement<'q>, sqlx::Error>,
    >
    where
        'c: 'e,
    {
        if let Some(transaction) = self.transaction.as_mut() {
            (&mut **transaction).prepare_with(sql, parameters)
        } else {
            tracing::warn!(
                "Transaction executor `prepare_with` function is running without an active transaction"
            );
            self.db.prepare_with(sql, parameters)
        }
    }

    fn describe<'e, 'q: 'e>(
        self,
        sql: &'q str,
    ) -> futures_util::future::BoxFuture<
        'e,
        std::result::Result<sqlx::Describe<Self::Database>, sqlx::Error>,
    >
    where
        'c: 'e,
    {
        if let Some(transaction) = self.transaction.as_mut() {
            (&mut **transaction).describe(sql)
        } else {
            tracing::warn!(
                "Transaction executor `describe` function is running without an active transaction"
            );
            self.db.describe(sql)
        }
    }
}
