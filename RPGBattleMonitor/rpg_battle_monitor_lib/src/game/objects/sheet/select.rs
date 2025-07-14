use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub(super) struct SelectOption {
    value: String,
    label: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(super) struct Select {
    options: Vec<SelectOption>,
}
