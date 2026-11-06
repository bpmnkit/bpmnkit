//! Port of `bpmn-parser.ts`.

use crate::model::BpmnDefinitions;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError(pub String);

pub fn parse_bpmn(_xml: &str) -> Result<BpmnDefinitions, ParseError> {
    Err(ParseError("not implemented".into()))
}
