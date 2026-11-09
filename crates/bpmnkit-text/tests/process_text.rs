//! Replays `conformance/text` parse and stream cases (format in `conformance/README.md`,
//! "Process text"), and its write cases (`input.bpmn`, or `case.json` with `input`).

use std::fs;
use std::path::{Path, PathBuf};

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_text::compact::{expand, CompactDiagram, ExpandOptions};
use bpmnkit_text::process_text::{
    parse_process_text, write_process_text, ProcessTextResult, ProcessTextStream,
    WriteProcessTextOptions,
};
use serde_json::Value;

fn text_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/text")
}

fn read(path: &Path) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))
}

/// `case.json` `expand`: the options the case's diagram is expanded with.
fn case_options(case_dir: &Path) -> ExpandOptions {
    let spec: Value = fs::read_to_string(case_dir.join("case.json"))
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or(Value::Null);
    let options = &spec["expand"];
    ExpandOptions {
        validate: options["validate"].as_bool().unwrap_or(true),
        placeholders: options["placeholders"].as_bool().unwrap_or(false),
        camunda_version: options["camundaVersion"].as_str().map(str::to_owned),
    }
}

/// `expand` + `serializeBpmn`, or the error message plus newline, as recorded.
fn expanded(diagram: &CompactDiagram, options: &ExpandOptions) -> (bool, String) {
    match expand(diagram, options) {
        Ok(defs) => (true, serialize_bpmn(&defs)),
        Err(e) => (false, format!("{}\n", e.message)),
    }
}

fn check_result(expected: &Path, result: &ProcessTextResult) -> Result<(), String> {
    let want: Value = serde_json::from_str(&read(&expected.join("result.json"))?)
        .map_err(|e| format!("result.json: {e}"))?;
    let got = serde_json::to_value(result).map_err(|e| e.to_string())?;
    if got != want {
        return Err(format!(
            "result differs\n--- got\n{}\n--- want\n{}",
            serde_json::to_string_pretty(&got).unwrap_or_default(),
            serde_json::to_string_pretty(&want).unwrap_or_default()
        ));
    }
    reset_id_counter();
    let options = case_options(expected.parent().unwrap_or(expected));
    let (ok, out) = expanded(&result.diagram, &options);
    let file = if ok { "output.bpmn" } else { "error.txt" };
    if read(&expected.join(file))? != out {
        return Err(format!("{file} differs"));
    }
    Ok(())
}

fn check_parse(dir: &Path) -> Result<(), String> {
    let input = read(&dir.join("input.txt"))?;
    reset_id_counter();
    let result = parse_process_text(&input);
    check_result(&dir.join("expected"), &result)
}

fn check_stream(dir: &Path, chunks: &[Value]) -> Result<(), String> {
    let expected = dir.join("expected");
    let frames: Vec<Option<String>> = serde_json::from_str(&read(&expected.join("frames.json"))?)
        .map_err(|e| format!("frames.json: {e}"))?;
    reset_id_counter();
    let mut stream = ProcessTextStream::new();
    for (i, chunk) in chunks.iter().enumerate() {
        let chunk = chunk.as_str().ok_or("chunk is not a string")?;
        let frame = stream
            .push(chunk)
            .map_err(|e| format!("chunk {i}: expand failed: {}", e.message))?;
        match (frame, frames.get(i).cloned().flatten()) {
            (None, None) => {}
            (Some(defs), Some(file)) => {
                if read(&expected.join(&file))? != serialize_bpmn(&defs) {
                    return Err(format!("{file} differs"));
                }
            }
            (got, _) => return Err(format!("chunk {i}: frame is_some = {}", got.is_some())),
        }
    }
    check_result(&expected, &stream.end())
}

fn check_case(dir: &Path) -> Option<Result<(), String>> {
    if dir.join("input.txt").exists() {
        return Some(check_parse(dir));
    }
    let case: Value = serde_json::from_str(&read(&dir.join("case.json")).ok()?).ok()?;
    let chunks = case.get("chunks")?.as_array()?;
    Some(check_stream(dir, chunks))
}

#[test]
fn process_text_cases_match_ts() {
    let mut ids: Vec<_> = fs::read_dir(text_dir())
        .expect("conformance/text")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.is_dir())
        .collect();
    ids.sort();
    let mut ran = 0;
    let mut failures = vec![];
    for dir in ids {
        let name = dir
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        let outcome = std::panic::catch_unwind(|| check_case(&dir))
            .unwrap_or_else(|_| Some(Err("panicked".into())));
        match outcome {
            None => {}
            Some(Ok(())) => ran += 1,
            Some(Err(why)) => {
                ran += 1;
                failures.push(format!("{name}: {why}"));
            }
        }
    }
    assert!(ran > 0, "no parse or stream case found");
    assert!(
        failures.is_empty(),
        "{} failing:\n{failures:#?}",
        failures.len()
    );
}

/// A write case: `writeProcessText(parseBpmn(input))` → `text.txt` and `written.json`.
fn check_write(dir: &Path) -> Result<(), String> {
    let input = if dir.join("input.bpmn").exists() {
        dir.join("input.bpmn")
    } else {
        let case: Value = serde_json::from_str(&read(&dir.join("case.json"))?)
            .map_err(|e| format!("case.json: {e}"))?;
        let input = case["input"].as_str().ok_or("case.json has no input")?;
        let local = dir.join(input);
        if local.exists() {
            local
        } else {
            text_dir().join("..").join(input)
        }
    };
    let defs = parse_bpmn(&read(&input)?).map_err(|e| format!("{e:?}"))?;
    let written = write_process_text(&defs, WriteProcessTextOptions::default());
    let expected = dir.join("expected");
    if read(&expected.join("text.txt"))? != written.text {
        return Err(format!("text differs\n--- got\n{}", written.text));
    }
    let want: Value = serde_json::from_str(&read(&expected.join("written.json"))?)
        .map_err(|e| format!("written.json: {e}"))?;
    let got = serde_json::to_value(&written.aliases).map_err(|e| e.to_string())?;
    if want["aliases"] != got {
        return Err("aliases differ".into());
    }
    Ok(())
}

#[test]
fn write_cases_match_ts() {
    let mut dirs: Vec<_> = fs::read_dir(text_dir())
        .expect("conformance/text")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.join("expected/text.txt").exists())
        .collect();
    dirs.sort();
    assert!(!dirs.is_empty(), "no write case found");
    let failures: Vec<String> = dirs
        .iter()
        .filter_map(|dir| {
            check_write(dir)
                .err()
                .map(|why| format!("{}: {why}", dir.display()))
        })
        .collect();
    assert!(
        failures.is_empty(),
        "{} failing:\n{failures:#?}",
        failures.len()
    );
}
