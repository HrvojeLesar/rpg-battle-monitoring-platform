use axum::{
    Json,
    extract::Path,
    http::{StatusCode, header},
    response::IntoResponse,
};

use crate::{
    api::error::{Error, Result},
    cdn::filesystem::Adapter,
    models::assets::{AssetManager, AssetThumbnail},
    webserver::extractors::database_connection_extractor::DbConn,
};

#[cfg(feature = "api_doc")]
mod doc {
    use utoipa::OpenApi;

    use crate::api::assets::serve;

    #[derive(OpenApi)]
    #[openapi(paths(serve::serve_file, serve::thumbnails))]
    pub(crate) struct ApiDoc;
}
#[cfg(feature = "api_doc")]
pub(crate) use doc::ApiDoc;

#[cfg_attr(feature = "api_doc",
    utoipa::path(
        post,
        path = "/{filename}", 
        responses(
            (status = 200, description = "Returns file data"),
            (status = 404, description = "Filename does not match any file")
        ),
        params(
            ("filename" = String, description = "Filename gotten from upload")
        )
    )
)]
pub async fn serve_file<F: Adapter>(
    conn: DbConn,
    Path(file_name): Path<String>,
    asset_manager: AssetManager<F>,
) -> Result<impl IntoResponse> {
    let asset = match asset_manager.get_by_name(conn.as_ref(), &file_name).await? {
        Some(asset) => asset,
        None => return Err(Error::FileNotFound { id: file_name }),
    };

    let data = asset_manager.load_file_data(&file_name).await?;

    Ok((StatusCode::OK, [(header::CONTENT_TYPE, asset.mime)], data).into_response())
}

#[cfg_attr(feature = "api_doc",
    utoipa::path(
        description = "List thumbnails for an asset",
        post,
        path = "/thumbnails/{image_id}", 
        responses(
            (status = 200, description = "List of thumbnails for an asset", content_type = "application/json", example = json!([{
                "asset": {
                    "id": 7,
                    "name": "8a148413c8a14b62a94666674bbc77d2.jpg",
                    "hash": "d37f2b50d00be562486df7997bea298dd0bf9cd34707bfbf16bd19cf694cdf95",
                    "mime": "image/jpeg",
                    "asset_type": "file",
                    "created_at": "2025-07-02T21:03:30"
                },
                "thumbnail": {
                    "id": 7,
                    "dimensions": "512x512",
                    "image_id": 9
                }
            }])),
        )
    )
)]
pub async fn thumbnails<F: Adapter>(
    conn: DbConn,
    Path(image_id): Path<i32>,
    asset_manager: AssetManager<F>,
) -> Result<Json<Vec<AssetThumbnail>>> {
    let thumbnails = asset_manager
        .get_thumbnails(conn.as_ref(), image_id)
        .await?;

    Ok(Json(thumbnails))
}
