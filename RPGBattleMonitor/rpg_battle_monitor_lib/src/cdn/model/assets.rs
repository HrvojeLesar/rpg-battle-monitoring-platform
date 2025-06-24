use std::fmt::Display;

use chrono::NaiveDateTime;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "assets")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub hash: String,
    pub mime: String,
    pub asset_type: String,
    pub created_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Clone, Copy)]
pub enum AssetType {
    Image,
    Thumbnail,
}

impl Display for AssetType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AssetType::Image => write!(f, "image"),
            AssetType::Thumbnail => write!(f, "thumbnail"),
        }
    }
}

impl From<Option<AssetType>> for AssetType {
    fn from(value: Option<AssetType>) -> Self {
        match value {
            Some(o) => o,
            None => AssetType::Image,
        }
    }
}

pub use assets_inner::*;
mod assets_inner {

    use std::io::Cursor;
    use std::path::Path;

    use crate::cdn::error::Result;
    use crate::cdn::filesystem::{Adapter, sha256_hash};
    use crate::cdn::model::assets::{ActiveModel, AssetType, Column, Entity};
    use crate::thumbnail::{configuration, create_thumbnails};
    use crate::webserver::extractors::local_fs_extractor::FSAdapter;
    use crate::{cdn::model::assets::Model, database::transaction::Transaction};

    pub type Asset = Model;
    use image::ImageFormat;
    use sea_orm::ActiveValue::Set;
    use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter};
    use tokio::task::spawn_blocking;
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

        pub async fn create(
            &self,
            user_give_filename: String,
            data: &[u8],
            asset_type: impl Into<AssetType>,
        ) -> Result<Asset> {
            let hash = sha256_hash(data);
            let uuid = Uuid::new_v4().to_string();

            if let Some(asset) = self.get_by_hash(&hash).await? {
                return Ok(asset);
            }

            let image_format = image::guess_format(data)?;
            let mime = image_format.to_mime_type().to_string();

            let name = format!("{uuid}.{}", image_format_to_extension(image_format));

            self.write_file(&name, data).await?;

            let asset = ActiveModel {
                name: Set(name),
                hash: Set(hash),
                mime: Set(mime),
                asset_type: Set(asset_type.into().to_string()),
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

        async fn write_file(&self, filename: &str, data: &[u8]) -> Result<()> {
            let path = Path::new(filename);
            self.fs_adapter.write_file(path, data).await?;

            Ok(())
        }

        pub async fn create_thumbnail_assets(
            &self,
            asset: &Asset,
            data: Option<&[u8]>,
        ) -> Result<Vec<Asset>> {
            let data = match data {
                Some(d) => d.to_vec(),
                None => self.fs_adapter.read_file(asset.name.as_ref()).await?,
            };

            let thumbnail_configurations = spawn_blocking(|| {
                let reader = Cursor::new(data);
                create_thumbnails(
                    reader,
                    &[
                        configuration::X512,
                        configuration::X256,
                        configuration::X128,
                    ],
                    None,
                )
            })
            .await??;

            let mut assets = Vec::with_capacity(3);

            for thumbnail in thumbnail_configurations {
                let data = spawn_blocking(|| {
                    let mut data = Vec::new();
                    let mut writer = Cursor::new(&mut data);
                    match thumbnail.write_to(&mut writer) {
                        Ok(_) => Some(data),
                        Err(e) => {
                            tracing::error!(error = ?e, "Failed to write thumbnail to memory");
                            None
                        }
                    }
                })
                .await?;

                if let Some(data) = data {
                    match self
                        .create("".to_string(), &data, AssetType::Thumbnail)
                        .await
                    {
                        Ok(asset) => assets.push(asset),
                        Err(e) => {
                            tracing::error!(error = ?e, "Failed to save thumbnail asset");
                        }
                    }
                }
            }

            Ok(assets)
        }

        pub async fn get_by_name(&self, uuid: &str) -> Result<Option<Asset>> {
            let (transaction, asset_result) = self
                .transaction
                .begin()
                .await?
                .exec(async |db| Ok(Entity::find().filter(Column::Name.eq(uuid)).one(db).await?))
                .await;

            let asset = asset_result?;

            transaction.commit().await?;

            Ok(asset)
        }

        pub async fn load_file_data<P: AsRef<Path>>(&self, path: P) -> Result<Vec<u8>> {
            Ok(self.fs_adapter.read_file(path.as_ref()).await?)
        }
    }

    fn image_format_to_extension(format: ImageFormat) -> &'static str {
        match format {
            ImageFormat::Avif => "avif",
            ImageFormat::Bmp => "bmp",
            ImageFormat::Gif => "gif",
            ImageFormat::Ico => "ico",
            ImageFormat::Jpeg => "jpeg",
            ImageFormat::Png => "png",
            ImageFormat::Pnm => "pnm",
            ImageFormat::Tga => "tga",
            ImageFormat::Tiff => "tiff",
            ImageFormat::WebP => "webp",
            _ => "png",
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
            model::assets::{self, AssetManager, AssetType},
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
            .create(get_random_filename(), TEST_IMAGE_BYTES, AssetType::Image)
            .await
            .unwrap();

        state
            .fs_handler
            .read_file(Path::new(&asset.name))
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn duplicate_assets_are_not_created() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        let asset1 = asset_manager
            .create(get_random_filename(), TEST_IMAGE_BYTES, None)
            .await
            .unwrap();

        let asset2 = asset_manager
            .create(get_random_filename(), TEST_IMAGE_BYTES, AssetType::Image)
            .await
            .unwrap();

        assert_eq!(asset1, asset2);

        let assets = assets::Entity::find().all(&state.database).await.unwrap();

        assert_eq!(1, assets.len());
        assert_eq!(assets[0], asset1);
        assert_eq!(assets[0], asset2);
    }

    #[tokio::test]
    async fn non_image_file_is_not_saved() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        assert!(
            asset_manager
                .create(get_random_filename(), b"", None)
                .await
                .is_err()
        );
        assert_eq!(
            0,
            assets::Entity::find()
                .all(&state.database)
                .await
                .unwrap()
                .len()
        );
    }
}
