//! BPMN processes, DMN decision tables and Camunda forms as Unicode box-drawing text, for
//! terminals and chat code blocks. The Rust twin of `@bpmnkit/ascii`: the output is
//! byte-identical to `renderBpmnAscii`, `renderDmnAscii` and `renderFormAscii`, held by the
//! `conformance/ascii/` cases.
//!
//! ```
//! use bpmnkit_ascii::{bpmn_xml_to_ascii, AsciiOptions};
//!
//! let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
//!   <bpmn:process id="p" name="Orders" isExecutable="true">
//!     <bpmn:startEvent id="s" name="Start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
//!     <bpmn:serviceTask id="t" name="Ship"><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:serviceTask>
//!     <bpmn:endEvent id="e"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
//!     <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/>
//!     <bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="e"/>
//!   </bpmn:process>
//! </bpmn:definitions>"#;
//! let text = bpmn_xml_to_ascii(xml, &AsciiOptions::default()).unwrap();
//! assert!(text.starts_with("Orders\n──────\n"));
//! assert!(text.contains("[svc] Ship"));
//! assert!(text.contains("○ Start"));
//! ```
//!
//! Lay-out runs on the grid engine of `bpmnkit-layout`; diagram interchange in the input is
//! ignored. Only the first process is drawn.

mod bpmn;
mod dmn;
mod form;
mod grid;
mod js;

use bpmnkit_bpmn::model::BpmnDefinitions;
use bpmnkit_dmn::DmnDefinitions;
use bpmnkit_form::FormDefinition;

/// The header line above the drawing.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub enum Title {
    /// The process name, DMN definitions name or form id (TS `title` unset).
    #[default]
    FromModel,
    /// No header (TS `title: false`).
    Hidden,
    /// This text (TS `title: "…"`); an empty string hides the header.
    Text(String),
}

/// Options shared by the three renderers (TS `RenderOptions`).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct AsciiOptions {
    pub title: Title,
}

impl AsciiOptions {
    /// Shows `title` instead of the model's name.
    pub fn title(mut self, title: impl Into<String>) -> Self {
        self.title = Title::Text(title.into());
        self
    }

    /// Drops the header.
    pub fn no_title(mut self) -> Self {
        self.title = Title::Hidden;
        self
    }
}

/// The input could not be parsed.
#[derive(Debug, Clone, PartialEq)]
pub enum AsciiError {
    Bpmn(bpmnkit_bpmn::ParseError),
    Dmn(bpmnkit_dmn::ParseError),
    Form(bpmnkit_form::ParseError),
}

impl std::fmt::Display for AsciiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AsciiError::Bpmn(e) => write!(f, "BPMN: {e}"),
            AsciiError::Dmn(e) => write!(f, "DMN: {e}"),
            AsciiError::Form(e) => write!(f, "form: {e}"),
        }
    }
}

impl std::error::Error for AsciiError {}

/// The first process as boxes and orthogonal flows (`renderBpmnAscii`); `"(empty)"` without one.
pub fn bpmn_to_ascii(definitions: &BpmnDefinitions, options: &AsciiOptions) -> String {
    js::to_string(&bpmn::render(definitions, options))
}

/// [`bpmn_to_ascii`] of BPMN XML.
pub fn bpmn_xml_to_ascii(xml: &str, options: &AsciiOptions) -> Result<String, AsciiError> {
    let defs = bpmnkit_bpmn::parse_bpmn(xml).map_err(AsciiError::Bpmn)?;
    Ok(bpmn_to_ascii(&defs, options))
}

/// Every decision table, blank-line separated (`renderDmnAscii`); `"(no decision tables)"`
/// without one.
pub fn dmn_to_ascii(definitions: &DmnDefinitions, options: &AsciiOptions) -> String {
    js::to_string(&dmn::render(definitions, options))
}

/// [`dmn_to_ascii`] of DMN XML.
pub fn dmn_xml_to_ascii(xml: &str, options: &AsciiOptions) -> Result<String, AsciiError> {
    let defs = bpmnkit_dmn::parse_dmn(xml).map_err(AsciiError::Dmn)?;
    Ok(dmn_to_ascii(&defs, options))
}

/// A text mock-up of the form's components (`renderFormAscii`).
pub fn form_to_ascii(form: &FormDefinition, options: &AsciiOptions) -> String {
    js::to_string(&form::render(form, options))
}

/// [`form_to_ascii`] of form JSON.
pub fn form_json_to_ascii(json: &str, options: &AsciiOptions) -> Result<String, AsciiError> {
    let form = bpmnkit_form::parse_form(json).map_err(AsciiError::Form)?;
    Ok(form_to_ascii(&form, options))
}

/// `resolveTitle` + header: `title\n───\n\nbody`, or the body alone.
fn titled(options: &AsciiOptions, model_name: Option<&str>, body: js::U16s) -> js::U16s {
    let title = match &options.title {
        Title::Hidden => return body,
        Title::Text(t) => t.as_str(),
        Title::FromModel => model_name.unwrap_or(""),
    };
    if title.is_empty() {
        return body;
    }
    let title = js::u(title);
    let rule = js::repeat("─", js::len(&title));
    [title, js::u("\n"), rule, js::u("\n\n"), body].concat()
}

#[cfg(test)]
mod tests {
    use super::*;

    const DEFS: &str = r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">"#;

    #[test]
    fn no_process_is_empty() {
        let xml = format!("{DEFS}</bpmn:definitions>");
        let out = bpmn_xml_to_ascii(&xml, &AsciiOptions::default()).unwrap();
        assert_eq!(out, "(empty)");
    }

    #[test]
    fn title_options() {
        let xml = format!(
            r#"{DEFS}<bpmn:process id="p" name="P"><bpmn:startEvent id="s"/></bpmn:process></bpmn:definitions>"#
        );
        let render = |o: AsciiOptions| bpmn_xml_to_ascii(&xml, &o).unwrap();
        assert!(render(AsciiOptions::default()).starts_with("P\n─\n\n"));
        assert!(render(AsciiOptions::default().title("Ab")).starts_with("Ab\n──\n\n"));
        assert!(!render(AsciiOptions::default().title("")).contains('P'));
        assert!(!render(AsciiOptions::default().no_title()).contains('P'));
    }

    #[test]
    fn parse_errors_name_the_format() {
        let err = form_json_to_ascii("[]", &AsciiOptions::default()).unwrap_err();
        assert!(err.to_string().starts_with("form: "));
    }
}
