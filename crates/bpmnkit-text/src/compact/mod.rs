//! BPMN compact form: a token-efficient JSON view of a model for language models
//! (`bpmn/compact.ts`, `bpmn/compact-stream.ts`).

mod compactify;
mod expand;
mod guard;
mod stream;
mod types;

pub use compactify::compactify;
pub use expand::{
    build_flow_element, default_flows, expand, is_connector_job_type, make_event_def,
    make_extensions, CompactRoots, ExpandOptions,
};
pub use guard::{assert_compact_diagram, expand_json};
pub use stream::{CompactStream, CompactStreamOptions};
pub use types::*;
