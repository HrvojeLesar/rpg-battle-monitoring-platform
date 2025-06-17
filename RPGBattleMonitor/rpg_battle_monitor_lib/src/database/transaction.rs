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

    pub async fn begin(&mut self) -> Result<&mut sqlx::Transaction<'static, DB>> {
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
