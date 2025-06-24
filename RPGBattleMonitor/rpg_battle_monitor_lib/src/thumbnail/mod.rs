use std::{
    cell::OnceCell,
    io::{BufRead, Seek, Write},
    sync::Arc,
};

use crate::thumbnail::{self, configuration::Configuration};
use image::{DynamicImage, GenericImageView, ImageFormat, ImageReader};

pub mod configuration;
pub mod error;
pub mod size;

pub struct Thumbnail<'a> {
    original_image: Arc<DynamicImage>,
    thumbnail: OnceCell<DynamicImage>,
    pub format: ImageFormat,
    pub configuration: &'a Configuration<'a>,
}

impl<'a> Thumbnail<'a> {
    pub fn new(
        image: Arc<DynamicImage>,
        format: ImageFormat,
        configuration: &'a Configuration<'a>,
    ) -> Self {
        Self {
            thumbnail: OnceCell::new(),
            format,
            original_image: image,
            configuration,
        }
    }

    pub fn write_to<W: Write + Seek>(self, writer: &mut W) -> Result<(), thumbnail::error::Error> {
        let thumbnail = self.get_thumbnail_image();
        thumbnail.write_to(writer, self.format)?;
        Ok(())
    }

    /// Gets the thumbnail
    /// If it does not exist this funcion will generate one
    /// and will not make the size of the thumbnail any largegr
    /// than the original image
    pub fn get_thumbnail_image(&self) -> &DynamicImage {
        if self.thumbnail.get().is_none() {
            let thumbnail = self.generate_thumbnail(self.get_dimensions());

            self.thumbnail
                .set(thumbnail)
                .map_err(|e| {
                    tracing::error!(error = ?e);
                    e
                })
                .expect("Tried to set cell twice");
        }

        self.thumbnail
            .get()
            .expect("Thumbnail should always be present")
    }

    fn generate_thumbnail(&self, dimensions: (u32, u32)) -> DynamicImage {
        let (width, height) = dimensions;

        self.original_image.thumbnail(width, height)
    }

    fn get_dimensions(&self) -> (u32, u32) {
        let (width, height) = self.configuration.size.get_dimensions();
        let (o_width, o_height) = self.original_image.dimensions();
        if width * height > o_width * o_height {
            (o_width, o_height)
        } else {
            (width, height)
        }
    }
}

pub fn create_thumbnails<'a, R: BufRead + Seek>(
    reader: R,
    configurations: &'a [thumbnail::Configuration<'a>],
    default_format: Option<ImageFormat>,
) -> Result<Vec<Thumbnail<'a>>, thumbnail::error::Error> {
    let image_reader = ImageReader::new(reader).with_guessed_format()?;
    let reader_image_format = image_reader.format();
    let image = Arc::new(image_reader.decode()?);

    let format = match reader_image_format {
        Some(f) => f,
        None => default_format.unwrap_or(ImageFormat::WebP),
    };

    let thumbnails = configurations
        .iter()
        .map(|conf| Thumbnail::new(image.clone(), format, conf))
        .collect();

    Ok(thumbnails)
}
