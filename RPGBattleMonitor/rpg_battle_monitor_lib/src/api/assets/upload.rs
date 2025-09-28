use axum::{Json, extract};
use sea_orm::TransactionTrait;
use serde::Serialize;

use crate::api::assets::gen_partial_asset_url;
use crate::cdn::filesystem::Adapter;
use crate::models::assets::{AssetManager, AssetType};

use crate::api::error::{Error, Result};
use crate::webserver::extractors::database_connection_extractor::DbConn;

#[cfg(feature = "api_doc")]
use utoipa::ToSchema;
#[cfg(feature = "api_doc")]
mod doc {
    use utoipa::OpenApi;

    use crate::api::assets::upload;

    #[derive(OpenApi)]
    #[cfg_attr(debug_assertions, openapi(paths(upload::upload, upload::upload_form)))]
    #[cfg_attr(not(debug_assertions), openapi(paths(upload::upload)))]
    pub(crate) struct ApiDoc;
}
#[cfg(feature = "api_doc")]
pub(crate) use doc::ApiDoc;

#[derive(Debug, Clone, Serialize, Default)]
#[cfg_attr(test, derive(serde::Deserialize))]
#[cfg_attr(feature = "api_doc", derive(ToSchema))]
#[serde(rename_all = "camelCase")]
pub struct UploadResponse {
    #[cfg_attr(feature = "api_doc", schema(example = 1))]
    id: i32,
    #[cfg_attr(feature = "api_doc", schema(example = "/api/assets/filename.png"))]
    url: String,
    #[cfg_attr(feature = "api_doc", schema(example = "filename.png"))]
    filename: String,
    #[cfg_attr(feature = "api_doc", schema(example = json!(["/api/assets/thumbnail-1.png", "/api/assets/thumbnail-2.png"])))]
    thumbnails: Vec<String>,
    #[cfg_attr(feature = "api_doc", schema(example = "filename.png"))]
    original_filename: String,
}

#[derive(Debug, Default)]
struct PartialUploadedFile {
    name: Option<String>,
    data: Option<Vec<u8>>,
}

impl TryInto<UploadedFile> for PartialUploadedFile {
    type Error = Error;

    fn try_into(self) -> std::result::Result<UploadedFile, Self::Error> {
        Ok(UploadedFile {
            name: self.name.ok_or(Error::FilenameEmpty)?,
            data: self.data.ok_or(Error::DataEmpty)?,
        })
    }
}

#[derive(Debug)]
struct UploadedFile {
    name: String,
    data: Vec<u8>,
}

impl UploadedFile {
    async fn from_multipart(mut multipart: extract::Multipart) -> Result<Self> {
        let mut partial_file = PartialUploadedFile::default();

        while let Some(field) = multipart.next_field().await? {
            let field_name = field.name().ok_or(Error::FieldHasNoName)?;
            match field_name {
                "filename" => {
                    let filename = field.text().await?;
                    if !filename.is_empty() {
                        partial_file.name = Some(filename);
                    }
                }
                "file" => {
                    partial_file.data = Some(field.bytes().await?.into());
                }
                _ => {}
            }
        }

        partial_file.try_into()
    }
}

#[cfg_attr(all(feature = "api_doc"),
    utoipa::path(
        post,
        path = "/upload", 
        responses(
            (status = 200, description = "Uploaded asset", body = UploadResponse)
        )
    )
)]
pub async fn upload<F: Adapter>(
    asset_manager: AssetManager<F>,
    conn: DbConn,
    multipart: extract::Multipart,
) -> Result<Json<UploadResponse>> {
    let file = UploadedFile::from_multipart(multipart).await?;

    let transaction = conn.begin().await?;

    // TODO: use name to identify how asset is called for some user uploading it
    let asset = asset_manager
        .create(
            &transaction,
            file.name.to_string(),
            &file.data,
            AssetType::File,
        )
        .await?;

    let thumbnails = if infer::is_image(&file.data) {
        asset_manager
            .create_thumbnail_assets(&transaction, &asset, Some(&file.data))
            .await?
    } else {
        vec![]
    };

    transaction.commit().await?;

    Ok(Json(UploadResponse {
        id: asset.id,
        thumbnails: thumbnails
            .into_iter()
            .map(|t| gen_partial_asset_url(&t.name))
            .collect(),
        url: gen_partial_asset_url(&asset.name),
        filename: asset.name,
        original_filename: asset.original_filename,
    }))
}

#[cfg_attr(all(feature = "api_doc", debug_assertions),
    utoipa::path(
        get,
        path = "/upload", 
        responses(
            (status = 200, description = "Asset upload form")
        )
    )
)]
#[cfg(debug_assertions)]
pub async fn upload_form() -> axum::response::Html<&'static str> {
    axum::response::Html(
        r#"
        <!doctype html>
        <html>
            <head></head>
            <body>
                <form action="/api/assets/upload" method="post" enctype="multipart/form-data">
                    <label>
                        Upload file:
                        <input type="file" name="file">
                    </label>
                    <label>
                        Some text:
                        <input type="input" name="filename">
                    </label>

                    <input type="submit" value="Upload files">
                </form>
            </body>
        </html>
        "#,
    )
}

#[cfg(test)]
mod test {
    use std::path::Path;

    use axum::Router;
    use axum_test::{
        TestServer,
        multipart::{MultipartForm, Part},
    };
    use sea_orm::EntityTrait;
    use serde_json::Value;

    use crate::{
        api::assets::upload::{UploadResponse, upload},
        cdn::filesystem::{FileSystem, temp_file_adapter::TempFileStore},
        models::assets::{self, AssetManager},
        utils::test_utils::{
            TEST_IMAGE_BYTES, get_app_state_with_temp_file_store, get_random_filename, new_test_app,
        },
        webserver::router::app_state::{AppState, AppStateTrait},
    };

    const UPLOAD_PATH: &str = "/upload";

    async fn get_upload_router() -> (Router, AppState<TempFileStore>) {
        let state = get_app_state_with_temp_file_store().await;

        let router = Router::new()
            .route(UPLOAD_PATH, axum::routing::post(upload))
            .with_state(state.clone());

        (router, state)
    }

    async fn get_upload_test_app() -> (TestServer, AppState<TempFileStore>) {
        let (test_router, state) = get_upload_router().await;

        (new_test_app(test_router), state)
    }

    #[tokio::test]
    async fn image_gets_uploaded() {
        let (server, state) = get_upload_test_app().await;

        let file = Part::bytes(TEST_IMAGE_BYTES);

        let filename = get_random_filename();
        let form = MultipartForm::new()
            .add_text("filename", filename)
            .add_part("file", file);

        let response = server.post(UPLOAD_PATH).multipart(form).await;
        let response_json = response.json::<UploadResponse>();

        let asset_manager = AssetManager::from(state.clone());

        asset_manager
            .get_by_name(&state.get_db(), &response_json.filename)
            .await
            .unwrap()
            .unwrap();

        let fshandler = state.fs_handler;
        let file = fshandler
            .read_file(Path::new(&response_json.filename))
            .await
            .unwrap();

        assert!(!file.is_empty());
    }

    #[tokio::test]
    async fn failed_upload_is_not_saved_to_db() {
        const INVALID_IMAGE_BYTES: &[u8] = b"";
        let (server, state) = get_upload_test_app().await;

        let file = Part::bytes(INVALID_IMAGE_BYTES);

        let filename = get_random_filename();
        let form = MultipartForm::new()
            .add_text("filename", filename)
            .add_part("file", file);

        let response = server
            .post(UPLOAD_PATH)
            .multipart(form)
            .expect_failure()
            .await;
        assert!(response.status_code().is_server_error());

        let response_json = response.json::<Value>();

        assert!(response_json["error"].is_string());

        let assets = assets::Entity::find().all(&state.get_db()).await.unwrap();

        assert!(assets.is_empty());
    }
}
