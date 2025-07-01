use std::fmt::Display;

pub use assets_inner::*;

use chrono::NaiveDateTime;
use sea_orm::{FromQueryResult, entity::prelude::*};
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
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
pub enum Relation {
    #[sea_orm(has_many = "super::thumbnails::Entity")]
    Thumbnail,
}

impl Related<super::thumbnails::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Thumbnail.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, FromQueryResult)]
pub struct AssetThumbnail {
    #[sea_orm(nested)]
    asset: Asset,
    #[sea_orm(nested)]
    thumbnail: super::thumbnails::Model,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum AssetType {
    File,
    Thumbnail,
}

impl Display for AssetType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AssetType::File => write!(f, "file"),
            AssetType::Thumbnail => write!(f, "thumbnail"),
        }
    }
}

impl From<Option<AssetType>> for AssetType {
    fn from(value: Option<AssetType>) -> Self {
        match value {
            Some(o) => o,
            None => AssetType::File,
        }
    }
}

mod assets_inner {

    use std::io::Cursor;
    use std::path::Path;

    use crate::cdn::error::{Error, Result};
    use crate::cdn::filesystem::{Adapter, sha256_hash};
    use crate::cdn::model::assets::Model;
    use crate::cdn::model::assets::{
        ActiveModel, AssetThumbnail, AssetType, Column, Entity, Relation,
    };
    use crate::cdn::model::thumbnails;
    use crate::thumbnail::{configuration, create_thumbnails};
    use crate::utils::{gen_uuid, run_blocking, unknown_mime_type};
    use crate::webserver::extractors::local_fs_extractor::FSAdapter;

    pub type Asset = Model;
    use infer::MatcherType;
    use sea_orm::ActiveValue::Set;
    use sea_orm::{
        ActiveModelTrait, ColumnTrait, ConnectionTrait, EntityTrait, JoinType, QueryFilter,
        QuerySelect, RelationTrait, SelectColumns,
    };

    pub struct AssetManager<F: Adapter> {
        fs_adapter: FSAdapter<F>,
    }

    impl<F: Adapter> AssetManager<F> {
        pub fn new(fs_adapter: FSAdapter<F>) -> Self {
            Self { fs_adapter }
        }

        pub async fn get_by_hash(
            &self,
            conn: &impl ConnectionTrait,
            hash: &str,
        ) -> Result<Option<Asset>> {
            Ok(Entity::find()
                .filter(Column::Hash.eq(hash))
                .one(conn)
                .await?)
        }

        pub async fn create(
            &self,
            conn: &impl ConnectionTrait,
            user_give_filename: String,
            data: &[u8],
            asset_type: impl Into<AssetType>,
        ) -> Result<Asset> {
            if data.is_empty() {
                return Err(Error::DataEmpty);
            }

            let hash = sha256_hash(data);
            let uuid = gen_uuid();

            if let Some(asset) = self.get_by_hash(conn, &hash).await? {
                return Ok(asset);
            }

            let mime_type = match infer::get(data) {
                Some(m) => m,
                None => unknown_mime_type(),
            };

            let (mime, name) = if mime_type.matcher_type() == MatcherType::Image {
                let image_format = image::guess_format(data)?;
                let extension = image_format.extensions_str().first().unwrap_or(&"");

                let mime = image_format.to_mime_type().to_string();
                let name = format!("{uuid}.{}", extension);

                (mime, name)
            } else {
                let extension = mime_type.extension();
                let name = format!("{uuid}.{}", extension);
                (mime_type.mime_type().to_string(), name)
            };

            let asset = self
                .create_asset(conn, name.clone(), hash, mime, asset_type.into())
                .await?;

            self.write_file(&name, data).await?;

            Ok(asset)
        }

        async fn create_asset(
            &self,
            conn: &impl ConnectionTrait,
            name: String,
            hash: String,
            mime: String,
            asset_type: AssetType,
        ) -> Result<Asset> {
            let asset = ActiveModel {
                name: Set(name),
                hash: Set(hash),
                mime: Set(mime),
                asset_type: Set(asset_type.to_string()),
                ..Default::default()
            };

            Ok(asset.insert(conn).await?)
        }

        async fn write_file(&self, filename: &str, data: &[u8]) -> Result<()> {
            let path = Path::new(filename);
            self.fs_adapter.write_file(path, data).await?;

            Ok(())
        }

        pub async fn create_thumbnail_assets(
            &self,
            conn: &impl ConnectionTrait,
            original_asset: &Asset,
            data: Option<&[u8]>,
        ) -> Result<Vec<Asset>> {
            let data = match data {
                Some(d) => d.to_vec(),
                None => {
                    self.fs_adapter
                        .read_file(original_asset.name.as_ref())
                        .await?
                }
            };

            let thumbnail_configurations = run_blocking(|| {
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
            .await?;

            let mut assets = Vec::with_capacity(3);

            for thumbnail in thumbnail_configurations {
                let thumbnail_active_model = thumbnails::ActiveModel {
                    dimensions: Set(thumbnail.configuration.name.to_string()),
                    image_id: Set(original_asset.id),
                    ..Default::default()
                };

                let data = run_blocking(|| {
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
                .await;

                thumbnail_active_model.insert(conn).await?;

                if let Some(data) = data {
                    match self
                        .create(conn, "".to_string(), &data, AssetType::Thumbnail)
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

        pub async fn get_by_name(
            &self,
            conn: &impl ConnectionTrait,
            uuid: &str,
        ) -> Result<Option<Asset>> {
            Ok(Entity::find()
                .filter(Column::Name.eq(uuid))
                .one(conn)
                .await?)
        }

        pub async fn load_file_data<P: AsRef<Path>>(&self, path: P) -> Result<Vec<u8>> {
            Ok(self.fs_adapter.read_file(path.as_ref()).await?)
        }

        pub async fn get_thumbnails(
            &self,
            conn: &impl ConnectionTrait,
            image_id: i32,
        ) -> Result<Vec<AssetThumbnail>> {
            Ok(Entity::find()
                .join(JoinType::LeftJoin, Relation::Thumbnail.def())
                .select_column(thumbnails::Column::Id)
                .select_column(thumbnails::Column::Dimensions)
                .select_column(thumbnails::Column::ImageId)
                .filter(thumbnails::Column::ImageId.eq(image_id))
                .into_model::<AssetThumbnail>()
                .all(conn)
                .await?)
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
            TEST_IMAGE_BYTES, TEST_PDF_BYTES, get_app_state_with_temp_file_store,
            get_random_filename,
        },
        webserver::router::app_state::AppStateTrait,
    };

    #[tokio::test]
    async fn asset_is_created() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        let asset = asset_manager
            .create(
                &state.get_db(),
                get_random_filename(),
                TEST_IMAGE_BYTES,
                AssetType::File,
            )
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
            .create(
                &state.get_db(),
                get_random_filename(),
                TEST_IMAGE_BYTES,
                None,
            )
            .await
            .unwrap();

        let asset2 = asset_manager
            .create(
                &state.get_db(),
                get_random_filename(),
                TEST_IMAGE_BYTES,
                AssetType::File,
            )
            .await
            .unwrap();

        assert_eq!(asset1, asset2);

        let assets = assets::Entity::find().all(&state.database).await.unwrap();

        assert_eq!(1, assets.len());
        assert_eq!(assets[0], asset1);
        assert_eq!(assets[0], asset2);
    }

    #[tokio::test]
    async fn asset_thumbnails_are_created() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        let asset = asset_manager
            .create(
                &state.get_db(),
                get_random_filename(),
                TEST_IMAGE_BYTES,
                AssetType::File,
            )
            .await
            .unwrap();

        state
            .fs_handler
            .read_file(Path::new(&asset.name))
            .await
            .unwrap();

        let thumbnail_asset = asset_manager
            .create_thumbnail_assets(&state.get_db(), &asset, None)
            .await
            .unwrap();

        let thumbnails = asset_manager
            .get_thumbnails(&state.get_db(), asset.id)
            .await
            .unwrap();
        assert_eq!(thumbnail_asset.len(), thumbnails.len());
        for (idx, thumbnail) in thumbnails.into_iter().enumerate() {
            assert_eq!(asset.id, thumbnail.thumbnail.image_id);
            assert_eq!(
                AssetType::Thumbnail.to_string(),
                thumbnail_asset[idx].asset_type
            );
            assert_eq!(
                AssetType::Thumbnail.to_string(),
                thumbnail_asset[idx].asset_type
            );
        }
    }

    #[tokio::test]
    async fn asset_has_correct_mime() {
        let state = get_app_state_with_temp_file_store().await;
        let asset_manager = AssetManager::from(state.clone());

        assert!(
            asset_manager
                .create(&state.get_db(), get_random_filename(), b"", None)
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

        assert_eq!(
            asset_manager
                .create(
                    &state.get_db(),
                    get_random_filename(),
                    TEST_IMAGE_BYTES,
                    None
                )
                .await
                .unwrap()
                .mime,
            "image/png"
        );

        assert_eq!(
            1,
            assets::Entity::find()
                .all(&state.database)
                .await
                .unwrap()
                .len()
        );

        assert_eq!(
            asset_manager
                .create(&state.get_db(), get_random_filename(), TEST_PDF_BYTES, None)
                .await
                .unwrap()
                .mime,
            "application/pdf"
        );

        assert_eq!(
            2,
            assets::Entity::find()
                .all(&state.database)
                .await
                .unwrap()
                .len()
        );
    }
}
