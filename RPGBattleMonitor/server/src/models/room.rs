use futures::TryFutureExt;
use sqlx::Row;

use super::{error::ModelError, ids::RoomId};

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct Room {
    pub id: RoomId,
}

impl Room {
    pub fn new() -> Self {
        Self { id: RoomId::new() }
    }

    pub async fn insert(
        &self,
        transaction: &mut sqlx::Transaction<'_, sqlx::Any>,
    ) -> Result<(), ModelError> {
        sqlx::query(
            "
            INSERT INTO room (id)
            VALUES ($1)
            ",
        )
        .bind(&self.id.to_string())
        .execute(&mut **transaction)
        .await?;
        Err(ModelError::Other("Not implemented"))?;
        Ok(())
    }

    pub async fn get_by_id(
        id: RoomId,
        transaction: &mut sqlx::Transaction<'_, sqlx::Any>,
    ) -> Result<Self, ModelError> {
        let row = sqlx::query(
            "
            SELECT * FROM room
            WHERE id = $1
            ",
        )
        .bind(&id.to_string())
        .fetch_one(&mut **transaction)
        .await?;

        Ok(Room {
            id: row.get::<String, &str>("id").try_into()?,
        })
    }
}
