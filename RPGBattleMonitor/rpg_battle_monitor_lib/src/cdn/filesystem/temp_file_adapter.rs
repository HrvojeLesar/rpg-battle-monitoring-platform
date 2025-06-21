use std::{
    io::{Cursor, Seek, Write},
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};

use tokio::io::{AsyncSeek, AsyncWrite};

use super::error::{Error, Result};
use crate::cdn::filesystem::{FileSystem, Writeable};

#[derive(Debug, Clone)]
struct TempFile {
    path: PathBuf,
    data: Vec<u8>,
}

#[derive(Debug, Clone, Default)]
pub struct TempFileStore {
    files: Arc<Mutex<Vec<TempFile>>>,
}

impl TempFileStore {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }

    fn read_file_sync(&self, path: &Path) -> Result<Vec<u8>> {
        if let Some(file) = self.files.lock().unwrap().iter().find(|f| f.path == path) {
            Ok(file.data.clone())
        } else {
            Err(Error::FileNotFound {
                path: path.to_path_buf(),
            })
        }
    }
}

impl FileSystem for TempFileStore {
    async fn file_exists(&self, path: &Path) -> Result<bool> {
        Ok(self.files.lock().unwrap().iter().any(|f| f.path == path))
    }

    async fn directory_exists(&self, path: &Path) -> Result<bool> {
        self.file_exists(path).await
    }

    async fn write_file(&self, path: &Path, data: &[u8]) -> Result<()> {
        let mut files = self.files.lock().unwrap();

        if let Some(existing_file) = files.iter_mut().find(|f| f.path == path) {
            existing_file.data = data.to_vec();
        } else {
            files.push(TempFile {
                path: path.to_path_buf(),
                data: data.to_vec(),
            });
        }

        Ok(())
    }

    async fn read_file(&self, path: &Path) -> Result<Vec<u8>> {
        self.read_file_sync(path)
    }

    async fn checksum(&self, path: &Path) -> Result<String> {
        let data = self.read_file(path).await?;

        Ok(super::sha256_hash(&data))
    }
}

impl Writeable for TempFileStore {
    async fn get_async_writer(&self, path: &Path) -> Result<impl AsyncWrite + AsyncSeek> {
        let data = self.read_file(path).await?;

        let file = Cursor::new(data);
        Ok(tokio::io::BufWriter::new(file))
    }

    fn get_sync_writer(&self, path: &Path) -> Result<impl Write + Seek> {
        let data = self.read_file_sync(path)?;
        let file = Cursor::new(data);

        Ok(std::io::BufWriter::new(file))
    }
}
