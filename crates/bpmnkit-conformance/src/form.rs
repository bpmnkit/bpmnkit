//! Replays `form/<case>/` against `bpmnkit-form`: `parse_form(input.form)` must equal
//! `expected/model.json` and `export_form` of it must equal `expected/roundtrip.form`. A case
//! TS rejects has `expected/error.txt` (the message, newline-terminated) instead of both.

use bpmnkit_form::{export_form, parse_form};
use serde_json::Value as Json;
use std::path::Path;

/// Compares numbers by value (TS writes `100`, serde writes `100.0`) and objects without regard
/// to key order. On a difference, returns the JSON path of the first one found.
fn json_diff(path: &str, a: &Json, b: &Json) -> Option<String> {
    match (a, b) {
        (Json::Number(x), Json::Number(y)) => {
            (x.as_f64() != y.as_f64()).then(|| format!("{path}: {x} != {y}"))
        }
        (Json::Array(x), Json::Array(y)) => {
            if x.len() != y.len() {
                return Some(format!("{path}: length {} != {}", x.len(), y.len()));
            }
            x.iter()
                .zip(y)
                .enumerate()
                .find_map(|(i, (x, y))| json_diff(&format!("{path}[{i}]"), x, y))
        }
        (Json::Object(x), Json::Object(y)) => {
            for (k, xv) in x {
                match y.get(k) {
                    Some(yv) => {
                        if let Some(d) = json_diff(&format!("{path}.{k}"), xv, yv) {
                            return Some(d);
                        }
                    }
                    None => return Some(format!("{path}.{k}: only in actual")),
                }
            }
            y.keys()
                .find(|k| !x.contains_key(*k))
                .map(|k| format!("{path}.{k}: only in expected"))
        }
        _ => (a != b).then(|| format!("{path}: {a} != {b}")),
    }
}

fn first_diff_line(actual: &str, expected: &str) -> String {
    let n = actual
        .lines()
        .zip(expected.lines())
        .position(|(a, e)| a != e)
        .unwrap_or_else(|| actual.lines().count().min(expected.lines().count()));
    format!(
        "line {}: {:?} != {:?}",
        n + 1,
        actual.lines().nth(n),
        expected.lines().nth(n)
    )
}

/// Runs one case (`form/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let read = |p: &str| {
        std::fs::read_to_string(case.join(p))
            .map_err(|e| format!("{}: {e}", case.join(p).display()))
    };
    let input = read("input.form")?;

    if case.join("expected/error.txt").exists() {
        let expected = read("expected/error.txt")?;
        return match parse_form(&input) {
            Ok(_) => Err(format!("parsed, expected error {expected:?}")),
            Err(e) => {
                let actual = format!("{e}\n");
                (actual == expected)
                    .then_some(())
                    .ok_or_else(|| format!("error.txt {actual:?} != {expected:?}"))
            }
        };
    }

    let expected_model: Json =
        serde_json::from_str(&read("expected/model.json")?).map_err(|e| e.to_string())?;
    let expected_form = read("expected/roundtrip.form")?;

    let form = parse_form(&input).map_err(|e| format!("parse: {e}"))?;
    let actual = serde_json::to_value(&form).map_err(|e| e.to_string())?;
    if let Some(d) = json_diff("$", &actual, &expected_model) {
        return Err(format!("model.json {d}"));
    }
    let text = export_form(&form);
    if text != expected_form {
        return Err(format!(
            "roundtrip.form {}",
            first_diff_line(&text, &expected_form)
        ));
    }
    Ok(())
}

/// Like [`check_case`] but a panic counts as a failure.
pub fn run_case(dir: &Path, id: &str) -> bool {
    std::panic::catch_unwind(|| check_case(dir, id))
        .map(|r| r.is_ok())
        .unwrap_or(false)
}
