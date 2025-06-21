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
    pub mime: String,
    pub created_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

pub use assets_inner::*;
mod assets_inner {

    use std::path::Path;

    use crate::cdn::error::Result;
    use crate::cdn::filesystem::{Adapter, sha256_hash};
    use crate::cdn::model::assets::{ActiveModel, Column, Entity};
    use crate::webserver::extractors::local_fs_extractor::FSAdapter;
    use crate::{cdn::model::assets::Model, database::transaction::Transaction};

    pub type Asset = Model;
    use sea_orm::ActiveValue::Set;
    use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter};
    use uuid::Uuid;

    pub struct AssetManager<F: Adapter> {
        transaction: Transaction,
        fs_adapter: FSAdapter<F>,
    }

    impl<F: Adapter> AssetManager<F> {
        pub fn new(transaction: Transaction, fs_adapter: FSAdapter<F>) -> Self {
            Self {
                transaction,
                fs_adapter,
            }
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

        pub async fn create(&self, name: String, data: &[u8]) -> Result<Asset> {
            let hash = sha256_hash(data);
            let uuid = Uuid::new_v4().to_string();

            if let Some(asset) = self.get_by_hash(&hash).await? {
                return Ok(asset);
            }

            let mime = image::guess_format(data)?.to_mime_type().to_string();

            let asset = ActiveModel {
                name: Set(name),
                uuid: Set(uuid.clone()),
                hash: Set(hash),
                mime: Set(mime),
                ..Default::default()
            };

            let (transaction, asset_result) = self
                .transaction
                .begin()
                .await?
                .exec(async |db| Ok(asset.insert(db).await?))
                .await;

            let asset = asset_result?;
            self.write_file(&uuid, data).await?;

            transaction.commit().await?;

            Ok(asset)
        }

        async fn write_file(&self, filename: &str, data: &[u8]) -> Result<()> {
            let path = Path::new(filename);
            self.fs_adapter.write_file(path, data).await?;

            Ok(())
        }

        pub async fn get_by_uuid(&self, uuid: &str) -> Result<Option<Asset>> {
            let (transaction, asset_result) = self
                .transaction
                .begin()
                .await?
                .exec(async |db| Ok(Entity::find().filter(Column::Uuid.eq(uuid)).one(db).await?))
                .await;

            let asset = asset_result?;

            transaction.commit().await?;

            Ok(asset)
        }

        pub async fn load_file_data<P: AsRef<Path>>(&self, path: P) -> Result<Vec<u8>> {
            Ok(self.fs_adapter.read_file(path.as_ref()).await?)
        }
    }
}

#[cfg(test)]
mod test {
    use std::path::Path;

    use sea_orm::EntityTrait;

    use crate::{
        cdn::{
            filesystem::FileSystem,
            model::assets::{self, AssetManager},
        },
        utils::test_utils::{
            TEST_IMAGE_BYTES, get_app_state_with_temp_file_store, get_random_filename,
        },
    };

    #[tokio::test]
    async fn asset_is_created() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        let asset = asset_manager
            .create(get_random_filename(), TEST_IMAGE_BYTES)
            .await
            .unwrap();

        state
            .fs_handler
            .read_file(Path::new(&asset.uuid))
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn duplicate_assets_are_not_created() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        let asset1 = asset_manager
            .create(get_random_filename(), TEST_IMAGE_BYTES)
            .await
            .unwrap();

        let asset2 = asset_manager
            .create(get_random_filename(), TEST_IMAGE_BYTES)
            .await
            .unwrap();

        assert_eq!(asset1, asset2);

        let assets = assets::Entity::find().all(&state.database).await.unwrap();

        assert_eq!(1, assets.len());
        assert_eq!(assets[0], asset1);
        assert_eq!(assets[0], asset2);
    }
}
