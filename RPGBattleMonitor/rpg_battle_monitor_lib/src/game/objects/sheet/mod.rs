use serde::{Deserialize, Serialize};

use crate::game::{
    error::Error,
    objects::sheet::{
        colour::Colour, image::Image, number::Number, radio::Radio, range::Range, select::Select,
    },
};

mod colour;
mod image;
mod number;
mod radio;
mod range;
mod select;

#[derive(Debug, Serialize, Deserialize)]
enum InputType {
    Colour(Colour),
    Image(Image),
    Number(Number),
    Radio(Radio),
    Range(Range),
    Select(Select),
    Text(String),
    Reference(Box<InputType>),
}

#[derive(Debug, Serialize, Deserialize)]
struct Attribute {
    identifier: String,
    input_type: InputType,
}

#[derive(Debug, Serialize, Deserialize)]
struct Sheet {
    version: i32,
    attributes: Vec<Attribute>, // Maybe a sorted list by identifier, so versioning can be done
}

impl TryFrom<crate::models::sheet::Model> for Sheet {
    type Error = Error;

    fn try_from(value: crate::models::sheet::Model) -> Result<Self, Self::Error> {
        Ok(Sheet {
            version: value.id,
            attributes: serde_json::from_value(value.attributes)?,
        })
    }
}
