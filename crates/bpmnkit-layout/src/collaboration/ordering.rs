//! Twin of `layout/collaboration/ordering.ts`.

/// `PoolLink`.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct PoolLink {
    pub from: usize,
    pub to: usize,
    pub weight: f64,
    pub from_depth: Option<f64>,
    pub to_depth: Option<f64>,
}

/// `orderPools(count, links)`: indices into the input order.
pub fn order_pools(count: usize, links: &[PoolLink]) -> Vec<usize> {
    let _ = (count, links);
    todo!("port collaboration/ordering.ts")
}
