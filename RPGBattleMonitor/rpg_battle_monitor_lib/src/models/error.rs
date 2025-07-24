use thiserror::Error;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    DbError(#[from] sea_orm::DbErr),

    #[error(transparent)]
    ImageError(#[from] image::error::ImageError),

    #[error(transparent)]
    CdnError(#[from] crate::cdn::filesystem::error::Error),

    #[error(transparent)]
    ThumbnailError(#[from] crate::thumbnail::error::Error),

    #[error("Data is empty")]
    DataEmpty,
}
