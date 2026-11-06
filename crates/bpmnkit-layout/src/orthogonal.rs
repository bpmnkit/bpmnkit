//! Twin of `layout/orthogonal.ts`.

use crate::types::{Bounds, Waypoint};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Side {
    Top,
    Right,
    Bottom,
    Left,
}

/// `Port`.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Port {
    pub point: Waypoint,
    pub side: Side,
    pub cost: Option<f64>,
}

/// `Partial<Record<Side, number>>`.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct SideCost {
    pub top: Option<f64>,
    pub right: Option<f64>,
    pub bottom: Option<f64>,
    pub left: Option<f64>,
}

/// `OrthogonalRequest`.
pub struct OrthogonalRequest<'a> {
    pub from: Vec<Port>,
    pub to: Vec<Port>,
    pub obstacles: Vec<Bounds>,
    pub crossings: Option<&'a dyn Fn(&Waypoint, &Waypoint) -> f64>,
    pub margin: Option<f64>,
}

/// `routeOrthogonal(request)`; `None` where TS returns `null`.
pub fn route_orthogonal(request: &OrthogonalRequest) -> Option<Vec<Waypoint>> {
    let _ = request;
    todo!("port orthogonal.ts")
}

/// `sidePorts(b, cost)`.
pub fn side_ports(b: &Bounds, cost: &SideCost) -> Vec<Port> {
    let _ = (b, cost);
    todo!("port orthogonal.ts")
}
