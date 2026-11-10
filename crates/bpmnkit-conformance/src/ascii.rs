//! Replays `ascii/<case>/`: the text of the case's input (`.bpmn`, `.dmn` or `.form`) with
//! `case.json` `options` must equal `expected/out.txt`, byte for byte.

use crate::first_diff_line;
use bpmnkit_ascii::{bpmn_xml_to_ascii, dmn_xml_to_ascii, form_json_to_ascii, AsciiOptions};
use serde_json::Value as Json;
use std::path::Path;

/// TS `RenderOptions` → [`AsciiOptions`].
fn options(o: Option<&Json>) -> Result<AsciiOptions, String> {
    let opts = AsciiOptions::default();
    match o.and_then(|o| o.get("title")) {
        None => Ok(opts),
        Some(Json::Bool(false)) => Ok(opts.no_title()),
        Some(Json::String(t)) => Ok(opts.title(t.as_str())),
        Some(v) => Err(format!("options.title: unexpected {v}")),
    }
}

/// Runs one case (`ascii/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let read = |p: &Path| std::fs::read_to_string(p).map_err(|e| format!("{}: {e}", p.display()));
    let spec: Json = serde_json::from_str(&read(&case.join("case.json"))?)
        .map_err(|e| format!("case.json: {e}"))?;
    let input = match spec.get("input").and_then(Json::as_str) {
        Some(rel) => dir.join(rel),
        None => ["input.bpmn", "input.dmn", "input.form"]
            .iter()
            .map(|f| case.join(f))
            .find(|p| p.exists())
            .ok_or("no input")?,
    };
    let opts = options(spec.get("options"))?;
    let text = read(&input)?;
    let got = match input.extension().and_then(|x| x.to_str()) {
        Some("dmn") => dmn_xml_to_ascii(&text, &opts),
        Some("form") => form_json_to_ascii(&text, &opts),
        _ => bpmn_xml_to_ascii(&text, &opts),
    }
    .map_err(|e| e.to_string())?
        // The recorder ends the file with a newline.
        + "\n";
    let want = read(&case.join("expected").join("out.txt"))?;
    if got == want {
        Ok(())
    } else {
        Err(format!("out.txt {}", first_diff_line(&got, &want)))
    }
}

/// Ids of ascii cases (`ascii/<case>`).
pub fn case_ids(dir: &Path) -> Vec<String> {
    crate::load_case_ids(dir, "ascii")
}
