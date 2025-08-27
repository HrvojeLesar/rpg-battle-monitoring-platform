use std::{fmt::Display, str::FromStr};

use crate::entity::error::{Error, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityKind(pub String);

// #[derive(Debug, Clone, Serialize, Deserialize)]
// pub enum EntityKind {
//     Scene,
//     TokenData,
//     Token,
// }
//
// impl EntityKind {
//     pub fn get_sort_order(&self) -> usize {
//         match self {
//             EntityKind::Scene => 1,
//             EntityKind::TokenData => 2,
//             EntityKind::Token => 3,
//         }
//     }
// }
//
// impl Display for EntityKind {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         match self {
//             EntityKind::Scene => write!(f, "Scene"),
//             EntityKind::TokenData => write!(f, "TokenData"),
//             EntityKind::Token => write!(f, "Token"),
//         }
//     }
// }
//
// impl FromStr for EntityKind {
//     type Err = Error;
//
//     fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
//         match s {
//             "Scene" => Ok(EntityKind::Scene),
//             "TokenData" => Ok(EntityKind::TokenData),
//             "Token" => Ok(EntityKind::Token),
//             _ => Err(Error::InvalidEntityKind(s.to_string())),
//         }
//     }
// }
