//! Replays `conformance/text` parse and stream cases (format in `conformance/README.md`,
//! "Process text"). Write cases (`input.bpmn`, or `case.json` with `input`) are the
//! writer's and are skipped here.

use std::fs;
use std::path::{Path, PathBuf};

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::serialize_bpmn;
use bpmnkit_text::compact::{expand, CompactDiagram};
use bpmnkit_text::process_text::{parse_process_text, ProcessTextResult, ProcessTextStream};
use serde_json::Value;

fn text_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/text")
}

fn read(path: &Path) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))
}

/// `expand` + `serializeBpmn`, or the error message plus newline, as recorded.
fn expanded(diagram: &CompactDiagram) -> (bool, String) {
    match expand(diagram) {
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
    let (ok, out) = expanded(&result.diagram);
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
