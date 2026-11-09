//! BPMN diagrams as SVG and PNG, the Rust twin of `@bpmnkit/core`'s `exportSvg`
//! (`packages/core/src/bpmn/svg.ts`).
//!
//! The SVG is the contract: [`bpmn_to_svg`] with default [`RenderOptions`] gives the same bytes
//! as TS `exportSvg(defs)`, held by the `conformance/render/` cases. With
//! [`RenderOptions::auto_layout`], models without diagram interchange are laid out first
//! (feature `auto-layout`, on by default).
//!
//! ```
//! use bpmnkit_render::{bpmn_xml_to_svg, RenderOptions, Theme};
//!
//! let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
//!   <bpmn:process id="p" isExecutable="true">
//!     <bpmn:startEvent id="s" name="Order received"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
//!     <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
//!     <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
//!   </bpmn:process>
//! </bpmn:definitions>"#;
//! # #[cfg(feature = "auto-layout")] {
//! let svg = bpmn_xml_to_svg(xml, &RenderOptions::default().theme(Theme::Dark).auto_layout(true)).unwrap();
//! assert!(svg.markup.starts_with("<svg "));
//! assert!(svg.markup.contains("Order received"));
//! assert_eq!(svg.elements.len(), 3); // two events and the flow
//! # }
//! ```
//!
//! Everything is pure and synchronous; in an async server, call it from `spawn_blocking`.
//!
//! # PNG
//!
//! Feature `png` adds [`svg_to_png`] / [`bpmn_to_png`] (resvg). Glyphs come from a bundled
//! Inter subset (Latin, Latin-1, Latin Extended-A; SIL OFL 1.1), so the image is the same on every
//! machine, also in containers without fonts; other scripts (CJK, emoji) draw as missing glyphs.
//! Feature `system-fonts` adds `FontSource::System` and `FontSource::Both` for wider coverage.
//! Label wrapping is an estimate shared with TS, so wrapped lines can be slightly wider or narrower
//! than the drawn glyphs; text is never clipped.
//!
//! ```ignore
//! use bpmnkit_render::{bpmn_xml_to_svg, svg_to_png, PngOptions, RenderOptions};
//! // A chat thumbnail: at most 800×600 CSS px, drawn at 2× for high-DPI screens.
//! let svg = bpmn_xml_to_svg(&xml, &RenderOptions::default().auto_layout(true).max_size(800.0, 600.0))?;
//! let png: Vec<u8> = svg_to_png(&svg, &PngOptions::default())?;
//! ```
//!
//! # Features
//!
//! | Feature | Default | Adds |
//! | --- | --- | --- |
//! | `auto-layout` | yes | [`RenderOptions::auto_layout`] (`bpmnkit-layout`) |
//! | `png` | no | [`svg_to_png`], [`bpmn_to_png`], [`PngOptions`] (resvg, ~2 MB, embedded font) |
//! | `embedded-font` | with `png` | the bundled Inter subset |
//! | `system-fonts` | no | `FontSource::System` / `FontSource::Both` |
//!
//! `png` + `embedded-font` builds for `wasm32-unknown-unknown`.

mod bpmn;
mod error;
mod icons;
mod label_style;
mod options;
#[cfg(feature = "png")]
mod png;
mod text;

pub use error::RenderError;
pub use options::{ColorMode, FontOptions, PlaneSelect, RenderOptions, Theme, ThemeColors};
#[cfg(feature = "png")]
pub use png::{bpmn_to_png, svg_to_png, FontSource, PngOptions, EMBEDDED_FAMILY};
pub use text::wrap_text;

use bpmnkit_bpmn::{BpmnBounds, BpmnDefinitions};

/// A rendered SVG document and what it shows.
#[derive(Debug, Clone, PartialEq)]
pub struct Svg {
    /// The full `<svg>` document.
    pub markup: String,
    /// Diagram coordinates shown, padding included.
    pub view_box: ViewBox,
    /// CSS px after `scale` and `max_size`.
    pub width: f64,
    pub height: f64,
    /// Elements actually drawn, in drawing order within edges then shapes.
    pub elements: Vec<RenderedElement>,
    pub warnings: Vec<RenderWarning>,
}

impl std::fmt::Display for Svg {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.markup)
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ViewBox {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

/// One drawn element, for overlays and click maps.
#[derive(Debug, Clone, PartialEq)]
pub struct RenderedElement {
    pub id: String,
    pub kind: ElementKind,
    pub geometry: Geometry,
}

/// What a drawn element is.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub enum ElementKind {
    /// A flow element, by its BPMN local name (`"serviceTask"`, `"exclusiveGateway"`, …).
    Flow(&'static str),
    SequenceFlow,
    MessageFlow,
    Association,
    Participant,
    Lane,
    TextAnnotation,
    Group,
}

/// DI geometry of a drawn element.
#[derive(Debug, Clone, PartialEq)]
pub enum Geometry {
    Shape(BpmnBounds),
    Edge(Vec<(f64, f64)>),
}

/// Something worth knowing about a render that still succeeded.
#[derive(Debug, Clone, PartialEq, Eq)]
#[non_exhaustive]
pub enum RenderWarning {
    /// The chosen plane was empty, so the model was auto-laid out first.
    AutoLayoutApplied,
    /// A flow element of the model has no shape on the drawn plane.
    ElementWithoutDi { id: String },
}

/// SVG for a BPMN model. Default options give the same bytes as TS `exportSvg(defs)`.
pub fn bpmn_to_svg(defs: &BpmnDefinitions, opts: &RenderOptions) -> Result<Svg, RenderError> {
    bpmn::render(defs, opts)
}

/// Parses BPMN XML and renders it: the CLI/chat-bot one-liner.
pub fn bpmn_xml_to_svg(xml: &str, opts: &RenderOptions) -> Result<Svg, RenderError> {
    let defs = bpmnkit_bpmn::parse_bpmn(xml)?;
    bpmn_to_svg(&defs, opts)
}
