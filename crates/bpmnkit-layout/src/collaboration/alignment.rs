//! Twin of `layout/collaboration/alignment.ts`.

/// `MessageLink`.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MessageLink {
    pub from_pool: usize,
    pub to_pool: usize,
    pub from_x: f64,
    pub to_x: f64,
}

/// `alignPools(count, widths, links)`: x offset per pool.
pub fn align_pools(count: usize, widths: &[f64], links: &[MessageLink]) -> Vec<f64> {
    let _ = (count, widths, links);
    todo!("port collaboration/alignment.ts")
}
