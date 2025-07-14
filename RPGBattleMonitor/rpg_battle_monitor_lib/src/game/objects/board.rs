use serde::{Deserialize, Serialize};

use crate::game::utils::Size;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
enum Grid {
    Square,
    // Hexagonal,
}

#[derive(Debug, Serialize, Deserialize)]
struct Board {
    grid: Grid,
    size: Size,
    cell_size: Size,
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
