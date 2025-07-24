use std::fmt::Display;

use serde::{Deserialize, Serialize};

use crate::game::{error::Error, utils::Size};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
struct CellSize(u64);

impl Default for CellSize {
    fn default() -> Self {
        Self(64)
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub(super) enum Grid {
    Square,
    // Hexagonal,
}

impl Display for Grid {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Grid::Square => write!(f, "Square"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Board {
    grid: Grid,
    size: Size,
    cell_size: CellSize,
}

impl Default for Board {
    fn default() -> Self {
        Self {
            size: Size::new(6400, 6400),
            cell_size: Default::default(),
            grid: Grid::Square,
        }
    }
}

impl TryFrom<crate::models::board::Board> for Board {
    type Error = Error;

    fn try_from(value: crate::models::board::Board) -> Result<Self, Self::Error> {
        Ok(Self {
            grid: serde_json::from_str(&value.grid)?,
            size: Size::new(value.width as u64, value.height as u64),
            cell_size: CellSize(value.cell_size as u64),
        })
    }
}

impl TryFrom<Board> for crate::models::board::Board {
    type Error = Error;

    fn try_from(value: Board) -> Result<Self, Self::Error> {
        Ok(Self {
            id: 0,
            grid: serde_json::to_string(&value.grid)?,
            width: value.size.width as i32,
            height: value.size.height as i32,
            cell_size: value.cell_size.0 as i32,
        })
    }
}

#[cfg(test)]
mod test {
    use crate::game::objects::board::Grid;

    #[test]
    fn serialize_grid() {
        let grid = Grid::Square;

        let grid_string = serde_json::to_string(&grid).unwrap();
        dbg!(&grid_string);

        let gridder: Grid = serde_json::from_str(&grid_string).unwrap();

        dbg!(gridder);
    }
}
