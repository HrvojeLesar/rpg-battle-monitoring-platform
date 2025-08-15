use serde_json::Value;

use crate::game::objects::board::{Board, Grid};

struct Token {
    unique_id: uuid::Uuid,
    attributes: Value,
}

struct Position {
    x: f64,
    y: f64,
}

struct TokenSceneMeta<'a> {
    token_ref: &'a Token,
    position: Position,
}

pub(crate) struct Scene<'a> {
    grid: Grid,
    tokens: Vec<TokenSceneMeta<'a>>,
}
