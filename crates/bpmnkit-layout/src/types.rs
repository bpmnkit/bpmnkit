//! Twin of `layout/types.ts`.

use indexmap::IndexMap;

/// `ELEMENT_SIZES[type]`: fixed `(width, height)` by element type.
pub fn element_size(kind: &str) -> Option<(f64, f64)> {
    Some(match kind {
        "startEvent"
        | "endEvent"
        | "intermediateThrowEvent"
        | "intermediateCatchEvent"
        | "boundaryEvent" => (36.0, 36.0),
        "serviceTask" | "scriptTask" | "userTask" | "sendTask" | "receiveTask"
        | "businessRuleTask" | "callActivity" | "task" | "manualTask" => (100.0, 80.0),
        "exclusiveGateway" | "parallelGateway" | "inclusiveGateway" | "eventBasedGateway"
        | "complexGateway" => (50.0, 50.0),
        "subProcess" | "adHocSubProcess" | "eventSubProcess" | "transaction" => (100.0, 80.0),
        "dataObject" | "dataObjectReference" => (36.0, 50.0),
        "dataStoreReference" => (50.0, 50.0),
        _ => return None,
    })
}

pub const GRID_CELL_WIDTH: f64 = 150.0;
pub const GRID_CELL_HEIGHT: f64 = 140.0;
pub const HORIZONTAL_SPACING: f64 = GRID_CELL_WIDTH - 100.0;
pub const VERTICAL_SPACING: f64 = GRID_CELL_HEIGHT - 80.0;
pub const SUBPROCESS_PADDING: f64 = 50.0;
pub const LABEL_CHAR_WIDTH: f64 = 7.0;
pub const LABEL_MIN_WIDTH: f64 = 40.0;
pub const LABEL_HEIGHT: f64 = 14.0;
pub const LABEL_VERTICAL_OFFSET: f64 = 10.0;

#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Bounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Waypoint {
    pub x: f64,
    pub y: f64,
}

/// `LayoutNode`. `kind` is TS's `type`.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct LayoutNode {
    pub id: String,
    pub kind: String,
    pub bounds: Bounds,
    pub layer: i64,
    pub position: i64,
    pub grid_row: Option<i64>,
    pub label: Option<String>,
    pub label_bounds: Option<Bounds>,
    pub is_expanded: Option<bool>,
}

#[derive(Debug, Clone, PartialEq, Default)]
pub struct LayoutEdge {
    pub id: String,
    pub source_ref: String,
    pub target_ref: String,
    pub waypoints: Vec<Waypoint>,
    pub label: Option<String>,
    pub label_bounds: Option<Bounds>,
}

/// One entry of `LayoutResult.lanes`.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct LaneBand {
    pub id: String,
    pub bounds: Bounds,
}

/// One entry of `LayoutResult.planes`.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct Plane {
    pub element_id: String,
    pub result: LayoutResult,
}

/// `LayoutResult`. `lanes` / `planes` are `None` where TS leaves them undefined.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct LayoutResult {
    pub nodes: Vec<LayoutNode>,
    pub edges: Vec<LayoutEdge>,
    pub lanes: Option<Vec<LaneBand>>,
    pub planes: Option<Vec<Plane>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum GridFill {
    #[default]
    Row,
    Column,
}

/// `GridHint`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct GridHint {
    pub columns: Option<i64>,
    pub fill: Option<GridFill>,
}

/// `AnnotationSide` (`annotations.ts`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AnnotationSide {
    Above,
    Below,
    Left,
    Right,
}

/// `LayoutHints`: placement requests from the builder; never written to the model.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct LayoutHints {
    pub grids: Option<IndexMap<String, GridHint>>,
    pub annotation_sides: Option<IndexMap<String, AnnotationSide>>,
}
