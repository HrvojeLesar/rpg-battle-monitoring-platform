use std::{fmt::Debug, sync::Arc};

use sea_orm::{DatabaseConnection, DatabaseTransaction, TransactionTrait};
use tokio::sync::Mutex;

use super::error::{Error, Result};

#[derive(Debug)]
struct TxHolder {
    transaction: Option<DatabaseTransaction>,
    counter: u32,
}

impl TxHolder {
    fn new() -> Self {
        Self {
            transaction: None,
            counter: 0,
        }
    }
}

#[derive(Debug)]
pub struct Transaction {
    pub db: DatabaseConnection,
    tx_holder: Arc<Mutex<TxHolder>>,
}

impl Transaction {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            db,
            tx_holder: Arc::new(Mutex::new(TxHolder::new())),
        }
    }

    pub async fn begin(&self) -> Result<&Self> {
        let tx_holder = &mut *self.tx_holder.lock().await;

        if tx_holder.transaction.is_some() {
            tx_holder.counter += 1;
        } else {
            let transaction = self.db.begin().await?;
            tx_holder.transaction.replace(transaction);
        }

        Ok(self)
    }

    pub async fn commit(&self) -> Result<&Self> {
        let tx_holder = &mut *self.tx_holder.lock().await;

        if let Some(transaction) = tx_holder.transaction.take() {
            if tx_holder.counter >= 1 {
                tx_holder.counter -= 1;
                tx_holder.transaction.replace(transaction);
            } else {
                transaction.commit().await?;
            }
            Ok(self)
        } else {
            Err(Error::NoTransaction)
        }
    }

    pub async fn rollback(&self) -> Result<&Self> {
        let tx_holder = &mut *self.tx_holder.lock().await;
        if let Some(transaction) = tx_holder.transaction.take() {
            if tx_holder.counter > 1 {
                tx_holder.counter -= 1;
                tx_holder.transaction.replace(transaction);
            } else {
                transaction.rollback().await?;
            }
            Ok(self)
        } else {
            Err(Error::NoTransaction)
        }
    }

    /// Will deadlock if begin, commit, rollback functions are called while executing f
    pub async fn exec<F, T>(&self, f: F) -> (&Self, Result<T>)
    where
        F: AsyncFnOnce(&DatabaseTransaction) -> Result<T>,
    {
        let tx_holder = self.tx_holder.lock().await;
        let transaction = tx_holder
            .transaction
            .as_ref()
            .unwrap_or_else(|| panic!("There is no active transaction"));

        (self, f(transaction).await)
    }
}
