use std::{
    io::{Seek, Write},
    ops::Deref,
    path::Path,
    sync::Arc,
};

pub mod error;
pub mod local_adapter;

use error::Result;
use sha2::{Digest, Sha256};
use tokio::io::{AsyncSeek, AsyncWrite};

pub trait FileSystem {
    fn file_exists(&self, path: &Path) -> impl Future<Output = Result<bool>> + Send;
    fn directory_exists(&self, path: &Path) -> impl Future<Output = Result<bool>> + Send;
    fn read_file(&self, path: &Path) -> impl Future<Output = Result<Vec<u8>>>;
    fn write_file(&self, path: &Path, data: &[u8]) -> impl Future<Output = Result<()>>;
    fn checksum(&self, path: &Path) -> impl Future<Output = Result<String>>;
}

pub trait Writeable: FileSystem {
    fn get_async_writer(
        &self,
        path: &Path,
    ) -> impl Future<Output = Result<impl AsyncWrite + AsyncSeek>>;
    fn get_sync_writer(&self, path: &Path) -> Result<impl Write + Seek>;
}

pub trait WritableFilesystem: FileSystem + Writeable {}
impl<T: FileSystem + Writeable> WritableFilesystem for T {}

pub fn sha256_hash(data: impl AsRef<[u8]>) -> String {
    format!("{:x}", Sha256::digest(data))
}

#[derive(Debug)]
pub struct Adapter<F: WritableFilesystem>(Arc<F>);

impl<F: WritableFilesystem> Adapter<F> {
    pub fn new(f: Arc<F>) -> Self {
        Self(f)
    }
}

impl<F> Clone for Adapter<F>
where
    F: WritableFilesystem,
{
    fn clone(&self) -> Self {
        Self(self.0.clone())
    }
}

impl<F: WritableFilesystem> Deref for Adapter<F> {
    type Target = F;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
