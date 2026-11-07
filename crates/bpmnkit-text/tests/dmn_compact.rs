//! Minimal replay of the `dmn-*` cases of `conformance/compact` (formats in
//! `conformance/README.md`) against `compactify_dmn` / `expand_dmn`. A full runner comes later.

use std::path::{Path, PathBuf};

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use bpmnkit_text::dmn_compact::{compactify_dmn, expand_dmn, CompactDmn};
use serde_json::Value;

fn norm(v: Value) -> Value {
    match v {
        Value::Number(n) => serde_json::json!(n.as_f64()),
        Value::Array(a) => Value::Array(a.into_iter().map(norm).collect()),
        Value::Object(o) => Value::Object(o.into_iter().map(|(k, v)| (k, norm(v))).collect()),
        v => v,
    }
}

fn read(p: &Path) -> String {
    std::fs::read_to_string(p).unwrap_or_else(|e| panic!("{}: {e}", p.display()))
}

fn json(p: &Path) -> Value {
    norm(serde_json::from_str(&read(p)).unwrap())
}

/// `input.*` named by `case.json`, relative to the case folder, else to `conformance/`.
fn input_path(dir: &Path, root: &Path) -> Option<PathBuf> {
    let case = dir.join("case.json");
    if !case.exists() {
        return None;
    }
    let case: Value = serde_json::from_str(&read(&case)).unwrap();
    let rel = case["input"].as_str()?;
    let local = dir.join(rel);
    Some(if local.exists() {
        local
    } else {
        root.join(rel)
    })
}

fn check_expand(compact: &CompactDmn, dir: &Path, model: &str, output: &str, error: &str) -> bool {
    reset_id_counter();
    let expected = dir.join("expected");
    match expand_dmn(compact) {
        Err(e) => format!("{e}\n") == read(&expected.join(error)),
        Ok(defs) => {
            let want_model = expected.join(model);
            let model_ok = !want_model.exists()
                || norm(serde_json::to_value(&defs).unwrap()) == json(&want_model);
            model_ok && serialize_dmn(&defs) == read(&expected.join(output))
        }
    }
}

#[test]
fn compact_dmn_cases() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance");
    let mut dirs: Vec<_> = std::fs::read_dir(root.join("compact"))
        .unwrap()
        .map(|e| e.unwrap().path())
        .filter(|p| p.file_name().unwrap().to_string_lossy().starts_with("dmn-"))
        .collect();
    dirs.sort();
    let (mut pass, mut failed) = (0, vec![]);
    for dir in dirs {
        let name = dir.file_name().unwrap().to_string_lossy().into_owned();
        let ok = if dir.join("input.dmn.json").exists() {
            let compact: CompactDmn =
                serde_json::from_str(&read(&dir.join("input.dmn.json"))).unwrap();
            check_expand(&compact, &dir, "model.json", "output.dmn", "error.txt")
        } else {
            let input = input_path(&dir, &root).unwrap_or_else(|| dir.join("input.dmn"));
            reset_id_counter();
            let defs = parse_dmn(&read(&input)).unwrap();
            let compact = compactify_dmn(&defs);
            let compact_ok = norm(serde_json::to_value(&compact).unwrap())
                == json(&dir.join("expected/compact.json"));
            let expanded = if dir.join("expected/expanded.error.txt").exists() {
                check_expand(&compact, &dir, "none", "none", "expanded.error.txt")
            } else {
                check_expand(&compact, &dir, "none", "expanded.dmn", "none")
            };
            compact_ok && expanded
        };
        if ok {
            pass += 1;
        } else {
            failed.push(name);
        }
    }
    eprintln!("dmn compact: {pass} passed, {} failed", failed.len());
    assert!(failed.is_empty(), "failed: {failed:?}");
    assert_eq!(pass, 41);
}
