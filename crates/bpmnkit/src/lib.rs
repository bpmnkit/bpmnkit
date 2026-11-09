#![doc = include_str!("../README.md")]

#[cfg(feature = "bpmn")]
pub use bpmnkit_bpmn as bpmn;
#[cfg(feature = "builder")]
pub use bpmnkit_builder as builder;
#[cfg(feature = "compat")]
pub use bpmnkit_compat as compat;
#[cfg(feature = "diff")]
pub use bpmnkit_diff as diff;
#[cfg(feature = "dmn")]
pub use bpmnkit_dmn as dmn;
#[cfg(feature = "feel")]
pub use bpmnkit_feel as feel;
#[cfg(feature = "form")]
pub use bpmnkit_form as form;
#[cfg(feature = "layout")]
pub use bpmnkit_layout as layout;
#[cfg(feature = "lint")]
pub use bpmnkit_lint as lint;
#[cfg(feature = "render")]
pub use bpmnkit_render as render;
#[cfg(feature = "spec")]
pub use bpmnkit_spec as spec;
#[cfg(feature = "text")]
pub use bpmnkit_text as text;
#[cfg(feature = "xml")]
pub use bpmnkit_xml as xml;

mod detect;
mod error;
#[cfg(all(feature = "text", feature = "render"))]
pub mod quick;

pub use detect::{detect, load, DocKind, Document};
pub use error::Error;

/// The names most programs import: `use bpmnkit::prelude::*;`.
pub mod prelude {
    pub use crate::{detect, load, DocKind, Document, Error};

    #[cfg(feature = "bpmn")]
    pub use bpmnkit_bpmn::{model::BpmnDefinitions, parse_bpmn, serialize_bpmn};
    #[cfg(feature = "diff")]
    pub use bpmnkit_diff::{diff_bpmn, diff_to_text, BpmnDiff, DiffTextOptions};
    #[cfg(feature = "diff-html")]
    pub use bpmnkit_diff::{diff_to_html, diff_to_svg, DiffHtmlOptions};
    #[cfg(feature = "dmn")]
    pub use bpmnkit_dmn::{parse_dmn, DmnDefinitions};
    #[cfg(feature = "feel")]
    pub use bpmnkit_feel::{evaluate, Context, Value};
    #[cfg(feature = "form")]
    pub use bpmnkit_form::{parse_form, FormDefinition};
    #[cfg(feature = "render-png")]
    pub use bpmnkit_render::{bpmn_to_png, svg_to_png, PngOptions};
    #[cfg(feature = "render")]
    pub use bpmnkit_render::{bpmn_to_svg, RenderOptions, Svg, Theme};
}
