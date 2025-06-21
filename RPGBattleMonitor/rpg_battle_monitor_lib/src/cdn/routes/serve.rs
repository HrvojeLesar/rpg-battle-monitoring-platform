use axum::{
    extract::Path,
    http::{StatusCode, header},
    response::IntoResponse,
};

use crate::cdn::{
    error::{Error, Result},
    filesystem::Adapter,
    model::assets::AssetManager,
};

pub async fn serve_file<F: Adapter>(
    Path(uuid): Path<String>,
    asset_manager: AssetManager<F>,
) -> Result<impl IntoResponse> {
    let asset = match asset_manager.get_by_uuid(&uuid).await? {
        Some(asset) => asset,
        None => return Err(Error::FileNotFound { id: uuid }),
    };

    let data = asset_manager.load_file_data(&uuid).await?;

    Ok((StatusCode::OK, [(header::CONTENT_TYPE, asset.mime)], data).into_response())
}
