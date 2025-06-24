use axum::{Json, extract};
use serde::Serialize;

use crate::cdn::model::assets::AssetType;
use crate::cdn::{filesystem::Adapter, model::assets::AssetManager};

use crate::cdn::error::{Error, Result};

#[cfg(feature = "api_v1_doc")]
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(upload_form, accept_form,))]
#[cfg(feature = "api_v1_doc")]
pub(crate) struct ApiDoc;

#[derive(Debug, Clone, Serialize, Default)]
#[cfg_attr(test, derive(serde::Deserialize))]
pub struct UploadResponse {
    id: i32,
    url: String,
    name: String,
    thumbnails: Vec<String>,
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

pub async fn upload<F: Adapter>(
    asset_manager: AssetManager<F>,
    multipart: extract::Multipart,
) -> Result<Json<UploadResponse>> {
    let file = UploadedFile::from_multipart(multipart).await?;

    // TODO: use name to identify how asset is called for some user uploading it
    let asset = asset_manager
        .create(file.name.to_string(), &file.data, AssetType::Image)
        .await?;

    let thumbnails = asset_manager
        .create_thumbnail_assets(&asset, Some(&file.data))
        .await?;

    Ok(Json(UploadResponse {
        id: asset.id,
        thumbnails: thumbnails.iter().map(|t| t.name.clone()).collect(),
        name: asset.name,
        ..Default::default()
    }))
}

#[cfg_attr(all(feature = "api_v1_doc", debug_assertions),
    utoipa::path(
        get,
        path = "/upload", 
        responses(
            (status = 200, description = "Asset upload form")
        )
    )
)]
pub async fn upload_form() -> axum::response::Html<&'static str> {
    axum::response::Html(
        r#"
        <!doctype html>
        <html>
            <head></head>
            <body>
                <form action="/api/v1/assets/upload" method="post" enctype="multipart/form-data">
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

#[cfg_attr(all(feature = "api_v1_doc", debug_assertions),
    utoipa::path(
        post,
        path = "/upload", 
        responses(
            (status = 200, description = "Asset upload form")
        )
    )
)]
pub async fn accept_form(mut multipart: extract::Multipart) {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        tracing::info!("Field: {}", &name);
    }
}

#[cfg(test)]
mod test {
    use std::path::Path;

    use axum::Router;
    use axum_test::{
        TestServer,
        multipart::{MultipartForm, Part},
    };

    use crate::{
        cdn::{
            filesystem::{FileSystem, temp_file_adapter::TempFileStore},
            model::assets::AssetManager,
            routes::upload::{UploadResponse, upload},
        },
        utils::test_utils::{
            TEST_IMAGE_BYTES, get_app_state_with_temp_file_store, get_random_filename, new_test_app,
        },
        webserver::router::app_state::AppState,
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
            .get_by_name(&response_json.name)
            .await
            .unwrap()
            .unwrap();

        let fshandler = state.fs_handler;
        let file = fshandler
            .read_file(Path::new(&response_json.name))
            .await
            .unwrap();

        assert!(!file.is_empty());
    }
}
