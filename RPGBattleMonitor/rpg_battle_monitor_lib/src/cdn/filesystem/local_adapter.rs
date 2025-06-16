use std::{
    io::{Seek, Write},
    path::{Path, PathBuf},
};

use axum::extract::FromRequestParts;
use tokio::io::{AsyncSeek, AsyncWrite};

use super::error::Result;
use crate::cdn::filesystem::{FileSystem, Writeable};

pub struct Local {
    location: PathBuf,
}

impl Local {
    pub fn new(location: PathBuf) -> Self {
        Self { location }
    }

    fn get_path(&self, path: &Path) -> PathBuf {
        self.location.join(path)
    }

    async fn create_parent(&self, path: &Path) -> Result<()> {
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                tokio::fs::create_dir_all(path).await?
            }
        }

        Ok(())
    }

    fn create_parent_sync(&self, path: &Path) -> Result<()> {
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                std::fs::create_dir_all(path)?;
            }
        }

        Ok(())
    }
}

impl FileSystem for Local {
    async fn file_exists(&self, path: &Path) -> Result<bool> {
        let path = self.get_path(path);
        if !path.is_file() {
            Ok(false)
        } else {
            Ok(path.exists())
        }
    }

    async fn directory_exists(&self, path: &Path) -> Result<bool> {
        let path = self.get_path(path);
        if !path.is_dir() {
            Ok(false)
        } else {
            Ok(path.exists())
        }
    }

    async fn write_file(&self, path: &Path, data: &[u8]) -> Result<()> {
        let path = self.get_path(path);
        self.create_parent(&path).await?;

        tokio::fs::write(path, data).await?;

        Ok(())
    }

    async fn read_file(&self, path: &Path) -> Result<Vec<u8>> {
        let path = self.get_path(path);
        self.file_exists(&path).await?;

        Ok(tokio::fs::read(path).await?)
    }

    async fn checksum(&self, path: &Path) -> Result<String> {
        let data = self.read_file(path).await?;

        Ok(super::sha256_hash(&data))
    }
}

impl Writeable for Local {
    async fn get_async_writer(&self, path: &Path) -> Result<impl AsyncWrite + AsyncSeek> {
        let path = self.get_path(path);
        self.create_parent(&path).await?;

        let file = tokio::fs::File::create_new(path).await?;
        Ok(tokio::io::BufWriter::new(file))
    }

    fn get_sync_writer(&self, path: &Path) -> Result<impl Write + Seek> {
        let path = self.get_path(path);
        self.create_parent_sync(&path)?;

        let file = std::fs::File::create_new(path)?;
        Ok(std::io::BufWriter::new(file))
    }
}
