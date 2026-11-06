//! Twin of `layout/grid/grid.ts`.
//!
//! Sparse row/column grid used by the grid layout engine. Port of bpmn-io
//! bpmn-auto-layout's Grid (lib/Grid.js) with two fixes: an explicit optional
//! position (upstream conflated [0,0] with "no position") and a working row-splice
//! guard.

/// `Grid<T>`. Cells compare by `PartialEq` where TS compares object identity, so the
/// engine stores element indices.
#[derive(Debug, Clone, Default)]
pub struct Grid<T> {
    grid: Vec<Vec<Option<T>>>,
}

impl<T: Clone + PartialEq> Grid<T> {
    pub fn new() -> Self {
        Grid { grid: Vec::new() }
    }

    /// `add`: without a position, start a new bottom row; with one, place exactly
    /// there. Panics where TS throws (occupied cell).
    pub fn add(&mut self, element: T, position: Option<(usize, usize)>) {
        let Some((row, col)) = position else {
            self.grid.push(vec![Some(element)]);
            return;
        };
        while self.grid.len() <= row {
            self.grid.push(Vec::new());
        }
        let grid_row = &mut self.grid[row];
        if grid_row.get(col).is_some_and(|c| c.is_some()) {
            panic!("Grid cell ({row},{col}) is already occupied");
        }
        // JS arrays grow with holes when assigned past the end.
        if grid_row.len() <= col {
            grid_row.resize(col + 1, None);
        }
        grid_row[col] = Some(element);
    }

    /// `createRow(afterIndex?)`.
    pub fn create_row(&mut self, after_index: Option<usize>) {
        match after_index {
            None => self.grid.push(Vec::new()),
            Some(i) => {
                let at = (i + 1).min(self.grid.len());
                self.grid.insert(at, Vec::new());
            }
        }
    }

    /// `createCol(afterIndex, count)`.
    pub fn create_col(&mut self, after_index: usize, count: usize) {
        for row in &mut self.grid {
            if row.len() > after_index {
                let at = after_index + 1;
                row.splice(at..at, std::iter::repeat_n(None, count));
            }
        }
    }

    /// `addAfter(element, newElement)`.
    pub fn add_after(&mut self, element: &T, new_element: T) {
        let Some((row, col)) = self.find(element) else {
            self.add(new_element, None);
            return;
        };
        let r = &mut self.grid[row];
        let at = (col + 1).min(r.len());
        r.insert(at, Some(new_element));
    }

    /// `addBelow(element, newElement)`.
    pub fn add_below(&mut self, element: &T, new_element: T) {
        let Some((row, col)) = self.find(element) else {
            self.add(new_element, None);
            return;
        };
        while self.grid.len() <= row + 1 {
            self.grid.push(Vec::new());
        }
        if self.grid[row + 1].get(col).is_some_and(|c| c.is_some()) {
            self.grid.insert(row + 1, Vec::new());
        }
        self.add(new_element, Some((row + 1, col)));
    }

    /// `find`: first cell (row-major) holding the element.
    pub fn find(&self, element: &T) -> Option<(usize, usize)> {
        for (r, row) in self.grid.iter().enumerate() {
            for (c, cell) in row.iter().enumerate() {
                if cell.as_ref() == Some(element) {
                    return Some((r, c));
                }
            }
        }
        None
    }

    /// `get(row, col)`.
    pub fn get(&self, row: usize, col: usize) -> Option<&T> {
        self.grid
            .get(row)
            .and_then(|r| r.get(col))
            .and_then(|c| c.as_ref())
    }

    /// `getElementsInRange(from, to)`: both corners inclusive, in any order.
    pub fn get_elements_in_range(&self, from: (i64, i64), to: (i64, i64)) -> Vec<T> {
        let r1 = from.0.min(to.0);
        let r2 = from.0.max(to.0);
        let c1 = from.1.min(to.1);
        let c2 = from.1.max(to.1);
        let mut out = Vec::new();
        for r in r1..=r2 {
            for c in c1..=c2 {
                if r < 0 || c < 0 {
                    continue;
                }
                if let Some(el) = self.get(r as usize, c as usize) {
                    out.push(el.clone());
                }
            }
        }
        out
    }

    /// `adjustGridPosition`: move an element to the current last column of the grid
    /// (right-align before a fan-out). No-op when that cell is occupied: upstream
    /// would overwrite; we keep the no-overwrite invariant.
    pub fn adjust_grid_position(&mut self, element: &T) {
        let Some((row, col)) = self.find(element) else {
            return;
        };
        let max_col = self.col_count() - 1;
        if (col as i64) < max_col as i64 - 1 && self.get(row, max_col).is_none() {
            let grid_row = &mut self.grid[row];
            grid_row[col] = None;
            while grid_row.len() <= max_col {
                grid_row.push(None);
            }
            grid_row[max_col] = Some(element.clone());
        }
    }

    /// `adjustRowForMultipleIncoming`.
    pub fn adjust_row_for_multiple_incoming(&mut self, sources: &[T], element: &T) {
        let Some((row, col)) = self.find(element) else {
            return;
        };
        let rows: Vec<usize> = sources
            .iter()
            .filter_map(|s| self.find(s).map(|p| p.0))
            .collect();
        let Some(&lowest_row) = rows.iter().min() else {
            return;
        };
        if lowest_row < row && self.get(lowest_row, col).is_none() {
            self.grid[row][col] = None;
            self.add(element.clone(), Some((lowest_row, col)));
        }
    }

    /// `adjustColumnForMultipleIncoming`.
    pub fn adjust_column_for_multiple_incoming(&mut self, sources: &[T], element: &T) {
        let Some((row, col)) = self.find(element) else {
            return;
        };
        let cols: Vec<usize> = sources
            .iter()
            .filter_map(|s| self.find(s).map(|p| p.1))
            .collect();
        let Some(&max_col) = cols.iter().max() else {
            return;
        };
        if max_col + 1 > col {
            let grid_row = &mut self.grid[row];
            grid_row[col] = None;
            // splice-free targeted set; grow the row as needed
            while grid_row.len() <= max_col + 1 {
                grid_row.push(None);
            }
            match grid_row[max_col + 1].clone() {
                None => grid_row[max_col + 1] = Some(element.clone()),
                Some(occupant) => self.add_below(&occupant, element.clone()),
            }
        }
    }

    /// `getAllElements`.
    pub fn get_all_elements(&self) -> Vec<T> {
        self.elements_by_position()
            .into_iter()
            .map(|(e, _, _)| e)
            .collect()
    }

    /// `getGridDimensions`.
    pub fn get_grid_dimensions(&self) -> (usize, usize) {
        (self.row_count(), self.col_count())
    }

    /// `elementsByPosition`: `(element, row, col)` in row-major order.
    pub fn elements_by_position(&self) -> Vec<(T, usize, usize)> {
        let mut out = Vec::new();
        for (r, row) in self.grid.iter().enumerate() {
            for (c, cell) in row.iter().enumerate() {
                if let Some(el) = cell {
                    out.push((el.clone(), r, c));
                }
            }
        }
        out
    }

    /// `getElementsTotal`: distinct elements.
    pub fn get_elements_total(&self) -> usize {
        let mut seen: Vec<T> = Vec::new();
        for e in self.get_all_elements() {
            if !seen.contains(&e) {
                seen.push(e);
            }
        }
        seen.len()
    }

    pub fn row_count(&self) -> usize {
        self.grid.len()
    }

    pub fn col_count(&self) -> usize {
        self.grid.iter().map(Vec::len).max().unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_find_and_dimensions() {
        let mut g: Grid<u32> = Grid::new();
        g.add(1, None);
        g.add_after(&1, 2);
        g.add_below(&1, 3);
        assert_eq!(g.find(&2), Some((0, 1)));
        assert_eq!(g.find(&3), Some((1, 0)));
        assert_eq!(g.get_grid_dimensions(), (2, 2));
        g.create_col(0, 2);
        assert_eq!(g.find(&2), Some((0, 3)));
        assert_eq!(g.get_elements_in_range((0, 0), (1, 3)).len(), 3);
    }

    #[test]
    fn add_below_splices_row_when_occupied() {
        let mut g: Grid<u32> = Grid::new();
        g.add(1, None);
        g.add(2, None);
        g.add_below(&1, 3);
        assert_eq!(g.find(&3), Some((1, 0)));
        assert_eq!(g.find(&2), Some((2, 0)));
    }

    #[test]
    #[should_panic(expected = "already occupied")]
    fn occupied_cell_panics() {
        let mut g: Grid<u32> = Grid::new();
        g.add(1, Some((0, 0)));
        g.add(2, Some((0, 0)));
    }
}
