//! `compact/` cases (conformance/README.md, "Compact"): BPMN `compactify` / `expand`, the
//! compact stream, and DMN `compactify_dmn` / `expand_dmn`, against what TS recorded.

use crate::bpmn::json_diff;
use crate::text::same_text;
use crate::tooling::{read, read_json};
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use bpmnkit_text::compact::{
    compactify, expand, expand_json, CompactDiagram, CompactStream, CompactStreamOptions,
};
use bpmnkit_text::dmn_compact::{compactify_dmn, expand_dmn, CompactDmn};
use bpmnkit_text::TextError;
use serde::Serialize;
use serde_json::Value as Json;
use std::path::{Path, PathBuf};

/// Ids of every `compact/` case.
pub fn case_ids(dir: &Path) -> Vec<String> {
    crate::load_case_ids(dir, "compact")
}

fn same_json<T: Serialize>(file: &str, actual: &T, expected: &Path) -> Result<(), String> {
    let got = serde_json::to_value(actual).map_err(|e| e.to_string())?;
    match json_diff("$", &got, &read_json(expected)?) {
        Some(d) => Err(format!("{file} {d}")),
        None => Ok(()),
    }
}

/// An `expand` outcome against `<output>` (+ `model.json` when `with_model`) or `<error>`.
fn check_expanded<T: Serialize>(
    expected: &Path,
    result: Result<T, TextError>,
    serialize: fn(&T) -> String,
    output: &str,
    error: &str,
    with_model: bool,
) -> Result<(), String> {
    let error_path = expected.join(error);
    match result {
        Err(e) => {
            let want = read(&error_path).map_err(|_| format!("threw {:?}", e.message))?;
            same_text(error, &format!("{}\n", e.message), &want)
        }
        Ok(_) if error_path.exists() => Err(format!("expanded, expected {:?}", read(&error_path)?)),
        Ok(defs) => {
            same_text(output, &serialize(&defs), &read(&expected.join(output))?)?;
            if with_model {
                same_json("model.json", &defs, &expected.join("model.json"))?;
            }
            Ok(())
        }
    }
}

fn check_bpmn(expected: &Path, input: &Path) -> Result<(), String> {
    reset_id_counter();
    let defs = parse_bpmn(&read(input)?).map_err(|e| format!("parse: {e}"))?;
    let compact = compactify(&defs);
    same_json("compact.json", &compact, &expected.join("compact.json"))?;
    reset_id_counter();
    let expanded = expand(&compact);
    check_expanded(
        expected,
        expanded,
        serialize_bpmn,
        "expanded.bpmn",
        "expanded.error.txt",
        false,
    )
}

fn check_dmn(expected: &Path, input: &Path) -> Result<(), String> {
    reset_id_counter();
    let defs = parse_dmn(&read(input)?).map_err(|e| format!("parse: {e}"))?;
    let compact = compactify_dmn(&defs);
    same_json("compact.json", &compact, &expected.join("compact.json"))?;
    reset_id_counter();
    let expanded = expand_dmn(&compact);
    check_expanded(
        expected,
        expanded,
        serialize_dmn,
        "expanded.dmn",
        "expanded.error.txt",
        false,
    )
}

fn check_stream(expected: &Path, spec: &Json) -> Result<(), String> {
    let chunks = spec["chunks"].as_array().ok_or("chunks is not an array")?;
    let base: Option<CompactDiagram> = match spec.get("base") {
        Some(b) if !b.is_null() => {
            Some(serde_json::from_value(b.clone()).map_err(|e| format!("base: {e}"))?)
        }
        _ => None,
    };
    let frames = read_json(&expected.join("frames.json"))?;
    reset_id_counter();
    let mut stream = CompactStream::new(CompactStreamOptions { base });
    for (i, chunk) in chunks.iter().enumerate() {
        let chunk = chunk.as_str().ok_or("chunk is not a string")?;
        match (stream.push(chunk), &frames[i]) {
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
    Ok(())
}

/// Replays one case (`compact/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let expected = case.join("expected");
    let spec = match case.join("case.json").exists() {
        true => read_json(&case.join("case.json"))?,
        false => Json::Null,
    };
    let named: Option<PathBuf> = spec.get("input").and_then(Json::as_str).map(|rel| {
        let local = case.join(rel);
        if local.exists() {
            local
        } else {
            dir.join(rel)
        }
    });
    let input = |file: &str| -> Option<PathBuf> {
        let direct = case.join(file);
        if direct.exists() {
            return Some(direct);
        }
        named
            .clone()
            .filter(|p| p.to_string_lossy().ends_with(&format!(".{}", &file[6..])))
    };
    if let Some(p) = input("input.dmn.json") {
        let compact: CompactDmn = serde_json::from_str(&read(&p)?).map_err(|e| e.to_string())?;
        reset_id_counter();
        let result = expand_dmn(&compact);
        return check_expanded(
            &expected,
            result,
            serialize_dmn,
            "output.dmn",
            "error.txt",
            true,
        );
    }
    if let Some(p) = input("input.json") {
        let json = read(&p)?;
        reset_id_counter();
        let result = expand_json(&json);
        return check_expanded(
            &expected,
            result,
            serialize_bpmn,
            "output.bpmn",
            "error.txt",
            true,
        );
    }
    if let Some(p) = input("input.bpmn") {
        return check_bpmn(&expected, &p);
    }
    if let Some(p) = input("input.dmn") {
        return check_dmn(&expected, &p);
    }
    if spec.get("chunks").is_some() {
        return check_stream(&expected, &spec);
    }
    Err("no input.* and no chunks".into())
}
