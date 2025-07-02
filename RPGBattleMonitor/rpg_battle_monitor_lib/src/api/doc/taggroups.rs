use std::{
    collections::{HashMap, HashSet},
    sync::{Mutex, OnceLock},
};

use serde::Serialize;
use utoipa::openapi::extensions::{Extensions, ExtensionsBuilder};

#[derive(Debug, Clone, Serialize)]
pub struct TagGroup {
    name: String,
    tags: HashSet<String>,
}

#[derive(Debug)]
pub struct TagGroups {
    groups: HashMap<String, TagGroup>,
}

#[derive(Debug)]
pub struct TabGroupsConfig {
    data: Mutex<TagGroups>,
}

impl TabGroupsConfig {
    pub fn add(&self, name: String, tags: HashSet<String>) {
        let mut lock = self.data.lock().unwrap();

        lock.groups
            .entry(name.clone())
            .and_modify(|t| {
                t.tags.extend(tags.clone());
            })
            .or_insert(TagGroup { name, tags });
    }

    pub fn to_extension(&self) -> Extensions {
        let mut lock = self.data.lock().unwrap();

        let groups = lock.groups.clone().into_values().collect::<Vec<TagGroup>>();
        let value = serde_json::to_value(groups).expect("Failed to parse tab groups");

        lock.groups = HashMap::new();

        ExtensionsBuilder::new().add("x-tagGroups", value).build()
    }
}

static INSTANCE: OnceLock<TabGroupsConfig> = OnceLock::new();
pub fn tag_groups_config() -> &'static TabGroupsConfig {
    INSTANCE.get_or_init(|| TabGroupsConfig {
        data: Mutex::new(TagGroups {
            groups: HashMap::new(),
        }),
    })
}
