//! Twin of `layout/repair.ts`.

use crate::orthogonal::Side;
use crate::types::{Bounds, Waypoint};

/// `ConnectionKind`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectionKind {
    Sequence,
    Message,
    Association,
}

/// `PlaneShape`.
#[derive(Debug, Clone, PartialEq)]
pub struct PlaneShape {
    pub id: String,
    pub bounds: Bounds,
    pub container: bool,
}

/// `PlaneEdge`.
#[derive(Debug, Clone, PartialEq)]
pub struct PlaneEdge {
    pub kind: ConnectionKind,
    pub source_ref: String,
    pub target_ref: String,
    pub waypoints: Vec<Waypoint>,
}

/// `repairRoutes(shapes, edges, related, boundarySide)`: rewrites `waypoints` in place.
pub fn repair_routes(
    shapes: &[PlaneShape],
    edges: &mut [PlaneEdge],
    related: &dyn Fn(&str) -> Vec<String>,
    boundary_side: &dyn Fn(&str) -> Option<Side>,
) {
    let _ = (shapes, edges, related, boundary_side);
    todo!("port layout/repair.ts")
}
