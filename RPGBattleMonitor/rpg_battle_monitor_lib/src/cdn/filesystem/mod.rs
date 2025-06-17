use std::{
    io::{Seek, Write},
    path::Path,
};

pub mod error;
pub mod local_adapter;

use error::Result;
use sha2::{Digest, Sha256};
use tokio::io::{AsyncSeek, AsyncWrite};

pub trait FileSystem {
    fn file_exists(&self, path: &Path) -> impl Future<Output = Result<bool>> + Send;
    fn directory_exists(&self, path: &Path) -> impl Future<Output = Result<bool>> + Send;
    fn read_file(&self, path: &Path) -> impl Future<Output = Result<Vec<u8>>> + Send;
    fn write_file(&self, path: &Path, data: &[u8]) -> impl Future<Output = Result<()>> + Send;
    fn checksum(&self, path: &Path) -> impl Future<Output = Result<String>> + Send;
}

pub trait Writeable: FileSystem {
    fn get_async_writer(
        &self,
        path: &Path,
    ) -> impl Future<Output = Result<impl AsyncWrite + AsyncSeek>>;
    fn get_sync_writer(&self, path: &Path) -> Result<impl Write + Seek>;
}

pub trait Adapter: FileSystem + Writeable + Send + Sync + Clone + 'static {}
impl<T: FileSystem + Writeable + Send + Sync + Clone + 'static> Adapter for T {}

pub fn sha256_hash(data: impl AsRef<[u8]>) -> String {
    format!("{:x}", Sha256::digest(data))
}
