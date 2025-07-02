use axum::{
    Json,
    extract::Path,
    http::{StatusCode, header},
    response::IntoResponse,
};

use crate::{
    cdn::{
        error::{Error, Result},
        filesystem::Adapter,
    },
    models::assets::{AssetManager, AssetThumbnail},
    webserver::extractors::database_connection_extractor::DbConn,
};

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
