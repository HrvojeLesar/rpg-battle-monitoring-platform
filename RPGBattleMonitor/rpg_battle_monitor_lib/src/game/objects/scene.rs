use crate::game::objects::{board::Board, token::Token};

#[derive(Debug)]
pub(crate) struct Scene {
    pub(crate) board: Board,
    tokens: Vec<Token>,
}

impl Scene {
    pub(crate) fn new(board: Board) -> Self {
        Self {
            board,
            tokens: vec![],
        }
    }
}
