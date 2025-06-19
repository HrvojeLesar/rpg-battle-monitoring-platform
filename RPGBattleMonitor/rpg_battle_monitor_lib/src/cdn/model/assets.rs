use chrono::NaiveDateTime;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "assets")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub uuid: String,
    pub name: String,
    pub hash: String,
    pub created_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

pub use assets_inner::*;
mod assets_inner {

    use crate::cdn::error::Result;
    use crate::cdn::filesystem::sha256_hash;
    use crate::cdn::model::assets::{ActiveModel, Column, Entity};
    use crate::{cdn::model::assets::Model, database::transaction::Transaction};

    pub type Asset = Model;
    use sea_orm::ActiveValue::Set;
    use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter};
    use uuid::Uuid;

    pub struct AssetManager {
        transaction: Transaction,
    }

    impl AssetManager {
        pub fn new(transaction: Transaction) -> Self {
            Self { transaction }
        }

        pub async fn get_by_hash(&self, hash: &str) -> Result<Option<Asset>> {
            let (transaction, asset_result) = self
                .transaction
                .begin()
                .await?
                .exec(async |db| Ok(Entity::find().filter(Column::Hash.eq(hash)).one(db).await?))
                .await;

            let asset = asset_result?;

            transaction.commit().await?;

            Ok(asset)
        }

        pub async fn create(&self, name: String, hash: String) -> Result<Asset> {
            let uuid = Uuid::new_v4();

            let asset = ActiveModel {
                name: Set(name),
                uuid: Set(uuid.to_string()),
                hash: Set(hash),
                ..Default::default()
            };

            let (transaction, asset_result) = self
                .transaction
                .begin()
                .await?
                .exec(async |db| Ok(asset.insert(db).await?))
                .await;

            let asset = asset_result?;

            transaction.commit().await?;

            Ok(asset)
        }

        pub async fn create_with_data(&self, name: String, data: &[u8]) -> Result<Asset> {
            let hash = sha256_hash(data);

            self.create(name, hash).await
        }
    }
}
