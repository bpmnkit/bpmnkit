//! Semantic diff of BPMN models: the Rust twin of `@bpmnkit/core`'s `diffBpmn`
//! (`bpmn/bpmn-diff.ts`), `projectSemantics` and `semanticHash` (`bpmn/semantic-hash.ts`).
//! TS is the oracle: both are held to `conformance/diff/`, hashes included.
//!
//! ```
//! use bpmnkit_diff::{diff_bpmn, diff_to_text, DiffTextOptions};
//!
//! let xml = |name: &str| format!(r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
//!   <bpmn:process id="p" isExecutable="true">
//!     <bpmn:task id="t" name="{name}" />
//!   </bpmn:process>
//! </bpmn:definitions>"#);
//! let before = bpmnkit_bpmn::parse_bpmn(&xml("Review")).unwrap();
//! let after = bpmnkit_bpmn::parse_bpmn(&xml("Check")).unwrap();
//!
//! let diff = diff_bpmn(&before, &after);
//! assert_eq!(diff.summary.changed, 1);
//! assert_eq!(diff.changes[0].fields[0].path, "name");
//! assert_ne!(diff.before_hash, diff.after_hash);
//! println!("{}", diff_to_text(&diff, &DiffTextOptions::default()));
//! ```
//!
//! Feature `html` adds [`diff_to_html`], a self-contained HTML viewer of both diagrams with the
//! changes highlighted, and [`diff_to_svg`], the later diagram with the changes drawn over it.

mod diff;
#[cfg(feature = "html")]
mod html;
mod js;
mod projection;
pub mod sha256;
mod text;

pub use diff::{
    diff_bpmn, BpmnDiff, ChangeKind, DiffSummary, ElementChange, FieldChange, Geometry,
    PlaneSummary, Point,
};
#[cfg(feature = "html")]
pub use html::{diff_to_html, diff_to_svg, DiffHtmlOptions};
pub use projection::{project_semantics, semantic_hash, SemanticProjection};
pub use text::{diff_to_text, DiffTextOptions};
