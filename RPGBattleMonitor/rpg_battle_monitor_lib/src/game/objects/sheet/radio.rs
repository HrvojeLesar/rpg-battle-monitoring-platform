use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub(super) struct Radio {
    selected_option: Option<usize>,
    options: Vec<String>,
}
