//! `text/` cases (conformance/README.md, "Process text"): `parse_process_text`, the process
//! text stream and `write_process_text` against what TS recorded.

use crate::bpmn::{first_diff_line, json_diff};
use crate::tooling::{read, read_json};
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_text::compact::expand;
use bpmnkit_text::process_text::{
    parse_process_text, write_process_text, ProcessTextResult, ProcessTextStream,
    WriteProcessTextOptions,
};
use serde_json::{json, Value as Json};
use std::path::Path;

/// Ids of every `text/` case.
pub fn case_ids(dir: &Path) -> Vec<String> {
    crate::load_case_ids(dir, "text")
}

/// `Err` naming the first differing line of a text file.
pub(crate) fn same_text(file: &str, actual: &str, expected: &str) -> Result<(), String> {
    if actual == expected {
        return Ok(());
    }
    Err(format!("{file} {}", first_diff_line(actual, expected)))
}

/// `result.json`, then `output.bpmn` (or `error.txt`) of expanding its diagram.
fn check_result(expected: &Path, result: &ProcessTextResult) -> Result<(), String> {
    let want = read_json(&expected.join("result.json"))?;
    let got = serde_json::to_value(result).map_err(|e| e.to_string())?;
    if let Some(d) = json_diff("$", &got, &want) {
        return Err(format!("result.json {d}"));
    }
    reset_id_counter();
    match expand(&result.diagram) {
        Ok(defs) => same_text(
            "output.bpmn",
            &serialize_bpmn(&defs),
            &read(&expected.join("output.bpmn"))?,
        ),
        Err(e) => same_text(
            "error.txt",
            &format!("{}\n", e.message),
            &read(&expected.join("error.txt")).unwrap_or_default(),
        ),
    }
}

fn check_parse(case: &Path) -> Result<(), String> {
    let input = read(&case.join("input.txt"))?;
    reset_id_counter();
    let result = parse_process_text(&input);
    check_result(&case.join("expected"), &result)
}

fn check_stream(case: &Path, chunks: &[Json]) -> Result<(), String> {
    let expected = case.join("expected");
    let frames = read_json(&expected.join("frames.json"))?;
    reset_id_counter();
    let mut stream = ProcessTextStream::new();
    for (i, chunk) in chunks.iter().enumerate() {
        let chunk = chunk.as_str().ok_or("chunk is not a string")?;
        let frame = stream
            .push(chunk)
            .map_err(|e| format!("chunk {i}: push threw {:?}", e.message))?;
        match (frame, &frames[i]) {
            (None, Json::Null) => {}
            (Some(defs), Json::String(file)) => {
                same_text(file, &serialize_bpmn(&defs), &read(&expected.join(file))?)?
            }
            (got, want) => {
                return Err(format!(
                    "chunk {i}: got {}, expected {want}",
                    if got.is_some() { "a frame" } else { "null" }
                ))
            }
        }
    }
    check_result(&expected, &stream.end())
}

fn check_write(case: &Path, input: &Path) -> Result<(), String> {
    let expected = case.join("expected");
    reset_id_counter();
    let defs = parse_bpmn(&read(input)?).map_err(|e| format!("parse: {e}"))?;
    let written = write_process_text(&defs, WriteProcessTextOptions::default());
    if expected.join("error.txt").exists() {
        return Err(format!(
            "wrote text, expected error {:?}",
            read(&expected.join("error.txt"))?
        ));
    }
    same_text(
        "text.txt",
        &written.text,
        &read(&expected.join("text.txt"))?,
    )?;
    let got =
        json!({ "aliases": serde_json::to_value(&written.aliases).map_err(|e| e.to_string())? });
    match json_diff("$", &got, &read_json(&expected.join("written.json"))?) {
        Some(d) => Err(format!("written.json {d}")),
        None => Ok(()),
    }
}

/// Replays one case (`text/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    if case.join("input.txt").exists() {
        return check_parse(&case);
    }
    let spec = match case.join("case.json").exists() {
        true => read_json(&case.join("case.json"))?,
        false => Json::Null,
    };
    if let Some(chunks) = spec.get("chunks") {
        return check_stream(&case, chunks.as_array().ok_or("chunks is not an array")?);
    }
    let input = match spec.get("input").and_then(Json::as_str) {
        Some(rel) => dir.join(rel),
        None => case.join("input.bpmn"),
    };
    check_write(&case, &input)
}
