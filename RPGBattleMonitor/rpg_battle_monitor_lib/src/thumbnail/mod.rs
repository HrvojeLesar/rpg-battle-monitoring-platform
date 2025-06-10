use std::io::{BufRead, Seek, Write};

use crate::thumbnail::{self, configuration::Configuration};
use image::{DynamicImage, ImageFormat, ImageReader};
use rayon::iter::{IntoParallelIterator, ParallelIterator};

pub mod configuration;
pub mod error;
pub mod size;

pub struct Thumbnail {
    thumbnail: DynamicImage,
    format: ImageFormat,
}

impl Thumbnail {
    pub fn new(image: &DynamicImage, format: ImageFormat, conf: &Configuration) -> Self {
        let (width, height) = conf.size.get_dimensions();
        let thumbnail = image.thumbnail(width, height);

        Self { thumbnail, format }
    }

    pub fn write_to<W: Write + Seek>(self, writer: &mut W) -> Result<(), thumbnail::error::Error> {
        self.thumbnail.write_to(writer, self.format)?;

        Ok(())
    }
}

pub fn create_thumbnails<R: BufRead + Seek>(
    reader: R,
    configurations: &[thumbnail::Configuration],
    default_format: Option<ImageFormat>,
) -> Result<Vec<Thumbnail>, thumbnail::error::Error> {
    let image_reader = ImageReader::new(reader).with_guessed_format()?;
    let reader_image_format = image_reader.format();
    let image = image_reader.decode()?;

    let format = match reader_image_format {
        Some(f) => f,
        None => default_format.unwrap_or(ImageFormat::WebP),
    };

    let thumbnails = configurations
        .into_par_iter()
        .map(|conf| Thumbnail::new(&image, format, conf))
        .collect();

    Ok(thumbnails)
}
