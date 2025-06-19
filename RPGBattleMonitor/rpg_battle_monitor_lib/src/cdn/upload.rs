use axum::extract;
use serde::Serialize;

use crate::cdn::{filesystem::Adapter, model::assets::AssetManager};

use super::error::{Error, Result};

#[cfg(feature = "api_v1_doc")]
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(upload_form, accept_form,))]
#[cfg(feature = "api_v1_doc")]
pub(super) struct ApiDoc;

#[derive(Debug, Clone, Serialize)]
struct UploadResponse {}

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
) -> Result<String> {
    let file = UploadedFile::from_multipart(multipart).await?;

    let asset = asset_manager
        .create(file.name.to_string(), &file.data)
        .await?;

    Ok(format! {"asset id: {}, hash: {}", asset.id, asset.hash})
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
