//! Oracle test for `parse_connector_line`; expected values from
//! `tests/oracle/connector_line.mjs` (TS, run against `packages/core/dist`).

use bpmnkit_text::connector_line::{parse_connector_line, ConnectorLine};
use bpmnkit_text::process_text::ProcessTextProblem;
use serde::Deserialize;

#[derive(Deserialize)]
struct Case {
    text: String,
    line: u32,
    result: Option<ConnectorLine>,
    problems: Vec<ProcessTextProblem>,
}

#[test]
fn connector_lines_match_ts() {
    // Typed straight from the text: a `serde_json::Value` would sort the `values` keys.
    let cases: Vec<Case> =
        serde_json::from_str(include_str!("oracle/connector_line.json")).expect("oracle");
    for case in cases {
        let mut problems = vec![];
        let result = parse_connector_line(&case.text, case.line, &mut problems);
        assert_eq!(result, case.result, "{}", case.text);
        if let Some(result) = &result {
            let expected = case.result.as_ref().map(|r| r.values.entries());
            assert_eq!(Some(result.values.entries()), expected, "{}", case.text);
        }
        assert_eq!(problems, case.problems, "{}", case.text);
    }
}
