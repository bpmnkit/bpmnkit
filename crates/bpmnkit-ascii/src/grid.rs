//! Twin of `packages/ascii/src/grid.ts` and `util.ts`.

use crate::js::{self, U16s};

/// `truncate(text, maxLen)`: at most `max` units, ending in "…" when shortened.
pub(crate) fn truncate(text: &[u16], max: i64) -> U16s {
    if max <= 0 {
        return vec![];
    }
    if js::len(text) <= max {
        return text.to_vec();
    }
    let ellipsis = '…' as u16;
    if max == 1 {
        return vec![ellipsis];
    }
    let mut out = js::head(text, max - 1).to_vec();
    out.push(ellipsis);
    out
}

/// Character canvas addressed by (col, row); writes outside it are ignored.
pub(crate) struct Grid {
    cells: Vec<U16s>,
    pub cols: i64,
    pub rows: i64,
}

impl Grid {
    pub fn new(cols: i64, rows: i64) -> Self {
        let (cols, rows) = (cols.max(0), rows.max(0));
        Grid {
            cells: vec![vec![b' ' as u16; cols as usize]; rows as usize],
            cols,
            rows,
        }
    }

    pub fn set(&mut self, col: i64, row: i64, ch: u16) {
        if col < 0 || col >= self.cols || row < 0 || row >= self.rows {
            return;
        }
        self.cells[row as usize][col as usize] = ch;
    }

    pub fn set_char(&mut self, col: i64, row: i64, ch: char) {
        self.set(col, row, ch as u16);
    }

    pub fn get(&self, col: i64, row: i64) -> u16 {
        if col < 0 || col >= self.cols || row < 0 || row >= self.rows {
            return b' ' as u16;
        }
        self.cells[row as usize][col as usize]
    }

    pub fn write(&mut self, col: i64, row: i64, text: &[u16]) {
        for (i, &c) in text.iter().enumerate() {
            self.set(col + i as i64, row, c);
        }
    }

    #[cfg(test)]
    pub fn write_str(&mut self, col: i64, row: i64, text: &str) {
        self.write(col, row, &js::u(text));
    }

    /// Sets a cell, merging with a box-drawing character already there.
    pub fn set_line(&mut self, col: i64, row: i64, ch: char) {
        let merged = merge_box_chars(self.get(col, row), ch as u16);
        self.set(col, row, merged);
    }

    /// Rows joined by `\n`, trailing whitespace stripped from each.
    pub fn render(&self) -> U16s {
        let rows: Vec<U16s> = self
            .cells
            .iter()
            .map(|r| js::trim_end(r).to_vec())
            .collect();
        js::join_lines(&rows)
    }
}

const L: u8 = 1;
const R: u8 = 2;
const U: u8 = 4;
const D: u8 = 8;

const BOX: [(char, u8); 11] = [
    ('─', L | R),
    ('│', U | D),
    ('┌', R | D),
    ('┐', L | D),
    ('└', R | U),
    ('┘', L | U),
    ('├', R | U | D),
    ('┤', L | U | D),
    ('┬', L | R | D),
    ('┴', L | R | U),
    ('┼', L | R | U | D),
];

fn dirs(ch: u16) -> Option<u8> {
    BOX.iter().find(|(c, _)| *c as u16 == ch).map(|&(_, d)| d)
}

fn is_arrow(ch: u16) -> bool {
    ch == '►' as u16 || ch == '▼' as u16 || ch == '▲' as u16
}

/// `mergeBoxChars`: the union of both characters' connections; arrows win.
pub(crate) fn merge_box_chars(existing: u16, next: u16) -> u16 {
    if existing == b' ' as u16 || existing == next {
        return next;
    }
    if is_arrow(next) {
        return next;
    }
    if is_arrow(existing) {
        return existing;
    }
    let (Some(e), Some(n)) = (dirs(existing), dirs(next)) else {
        return next;
    };
    BOX.iter()
        .find(|&&(_, d)| d == e | n)
        .map_or(next, |&(c, _)| c as u16)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn merges_junctions() {
        let mut g = Grid::new(5, 3);
        g.set_line(2, 1, '─');
        g.set_line(2, 1, '│');
        assert_eq!(g.get(2, 1), '┼' as u16);
        assert_eq!(merge_box_chars('─' as u16, '┐' as u16), '┬' as u16);
        assert_eq!(merge_box_chars('►' as u16, '│' as u16), '►' as u16);
    }

    #[test]
    fn strips_trailing_spaces() {
        let mut g = Grid::new(10, 1);
        g.write_str(0, 0, "hi");
        assert_eq!(js::to_string(&g.render()), "hi");
    }

    #[test]
    fn truncates_in_utf16_units() {
        let t = |s: &str, n| js::to_string(&truncate(&js::u(s), n));
        assert_eq!(t("hello", 3), "he…");
        assert_eq!(t("hello", 1), "…");
        assert_eq!(t("hello", 0), "");
        assert_eq!(t("hi", 5), "hi");
    }
}
