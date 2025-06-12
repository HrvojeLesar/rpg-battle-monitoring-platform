use std::io::Cursor;

use image::GenericImageView;
use rpg_battle_monitor_lib::thumbnail::{Thumbnail, configuration, create_thumbnails, size};

use crate::thumbnail::{WIP_2048X2048_IMAGE_BYTES, WIP_IMAGE_BYTES};

macro_rules! thumbnail_confugration_x {
    ($function_name:ident, $times:ident, $source:ident) => {
        #[test]
        fn $function_name() {
            let configurations = [configuration::$times];
            let thumbs = thumbnails(&configurations, $source);

            assert_eq!(thumbs.len(), configurations.len());

            let thumb = &thumbs[0];
            let thumbnail_image = thumb.get_thumbnail_image();

            assert!(size::Size::$times.get_dimensions() >= thumbnail_image.dimensions());
        }
    };
}

thumbnail_confugration_x!(thumbnail_configuration_x8, X8, WIP_IMAGE_BYTES);
thumbnail_confugration_x!(thumbnail_configuration_x16, X16, WIP_IMAGE_BYTES);
thumbnail_confugration_x!(thumbnail_configuration_x32, X32, WIP_IMAGE_BYTES);
thumbnail_confugration_x!(thumbnail_configuration_x64, X64, WIP_IMAGE_BYTES);
thumbnail_confugration_x!(thumbnail_configuration_x128, X128, WIP_IMAGE_BYTES);
thumbnail_confugration_x!(thumbnail_configuration_x256, X256, WIP_IMAGE_BYTES);
thumbnail_confugration_x!(thumbnail_configuration_x512, X512, WIP_IMAGE_BYTES);

thumbnail_confugration_x!(
    thumbnail_configuration_x8_2048,
    X8,
    WIP_2048X2048_IMAGE_BYTES
);
thumbnail_confugration_x!(
    thumbnail_configuration_x16_2048,
    X16,
    WIP_2048X2048_IMAGE_BYTES
);
thumbnail_confugration_x!(
    thumbnail_configuration_x32_2048,
    X32,
    WIP_2048X2048_IMAGE_BYTES
);
thumbnail_confugration_x!(
    thumbnail_configuration_x64_2048,
    X64,
    WIP_2048X2048_IMAGE_BYTES
);
thumbnail_confugration_x!(
    thumbnail_configuration_x128_2048,
    X128,
    WIP_2048X2048_IMAGE_BYTES
);
thumbnail_confugration_x!(
    thumbnail_configuration_x256_2048,
    X256,
    WIP_2048X2048_IMAGE_BYTES
);
thumbnail_confugration_x!(
    thumbnail_configuration_x512_2048,
    X512,
    WIP_2048X2048_IMAGE_BYTES
);

#[test]
fn custom_configuration_thumbnail_is_smaller_than_source_image() {
    let size = size::Size::Custom((1024, 1024));
    let conf = configuration::Configuration::new("custom", size.clone());
    let configurations = [conf];
    let thumbs = thumbnails(&configurations, WIP_IMAGE_BYTES);

    assert_eq!(thumbs.len(), configurations.len());

    let thumb = &thumbs[0];
    let thumbnail_image = thumb.get_thumbnail_image();

    assert!(size.get_dimensions() >= thumbnail_image.dimensions());
}

#[test]
fn custom_configuration_thumbnail_is_smaller_than_source_image_2048() {
    let size = size::Size::Custom((5000, 5000));
    let conf = configuration::Configuration::new("custom", size.clone());
    let configurations = [conf];
    let thumbs = thumbnails(&configurations, WIP_IMAGE_BYTES);

    assert_eq!(thumbs.len(), configurations.len());

    let thumb = &thumbs[0];
    let thumbnail_image = thumb.get_thumbnail_image();

    assert!(size.get_dimensions() >= thumbnail_image.dimensions());
}

fn thumbnails<'a>(
    configuration: &'a [configuration::Configuration],
    source: &[u8],
) -> Vec<Thumbnail<'a>> {
    let reader = Cursor::new(source);
    create_thumbnails(reader, configuration, None).unwrap()
}
