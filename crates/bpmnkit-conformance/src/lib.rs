//! Loads the language-neutral conformance cases under `conformance/` and
//! compares results canonically, so the TS and Rust implementations are held
//! to the same expectations.

mod bpmn;
pub mod compat;
mod dmn;
mod feel;
mod form;
pub mod lint;
pub mod migrate;
pub mod optimize;
pub mod tooling;
mod value;

pub use bpmn::{check_case as check_bpmn_case, run_case as run_bpmn_case};
pub use dmn::{
    check_case as check_dmn_case, check_eval_case as check_dmn_eval_case, eval_case_ids,
    run_case as run_dmn_case, run_eval_case as run_dmn_eval_case,
};
pub use feel::evaluate as evaluate_feel;
pub use form::{check_case as check_form_case, run_case as run_form_case};
pub use value::{decimal_eq, Value};

use serde::Deserialize;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

/// `<repo>/conformance`, independent of the working directory.
pub fn conformance_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance")
}

#[derive(Debug, Clone, Deserialize)]
pub struct FeelCase {
    pub id: String,
    pub expr: String,
    #[serde(default)]
    pub context: BTreeMap<String, Value>,
    pub expected: Value,
}

/// Reads every `feel/*.jsonl` file (sorted, blank lines skipped).
pub fn load_feel_cases(dir: &Path) -> Result<Vec<FeelCase>, String> {
    let feel = dir.join("feel");
    let Ok(rd) = std::fs::read_dir(&feel) else {
        return Ok(vec![]);
    };
    let mut files: Vec<_> = rd
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
        .collect();
    files.sort();
    let mut cases = vec![];
    for f in files {
        let text = std::fs::read_to_string(&f).map_err(|e| format!("{}: {e}", f.display()))?;
        for (i, line) in text
            .lines()
            .enumerate()
            .filter(|(_, l)| !l.trim().is_empty())
        {
            let c: FeelCase = serde_json::from_str(line)
                .map_err(|e| format!("{}:{}: {e}", f.display(), i + 1))?;
            cases.push(c);
        }
    }
    Ok(cases)
}

/// Ids of the cases of one kind (`<kind>/<case>`), one per directory.
fn load_case_ids(dir: &Path, kind: &str) -> Vec<String> {
    let Ok(rd) = std::fs::read_dir(dir.join(kind)) else {
        return vec![];
    };
    let mut ids: Vec<_> = rd
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .map(|e| format!("{kind}/{}", e.file_name().to_string_lossy()))
        .collect();
    ids.sort();
    ids
}

/// Ids of BPMN cases (`bpmn/<case>`).
pub fn load_bpmn_case_ids(dir: &Path) -> Vec<String> {
    load_case_ids(dir, "bpmn")
}

/// Ids of form cases (`form/<case>`).
pub fn load_form_case_ids(dir: &Path) -> Vec<String> {
    load_case_ids(dir, "form")
}

/// Ids of DMN cases (`dmn/<case>`).
pub fn load_dmn_case_ids(dir: &Path) -> Vec<String> {
    load_case_ids(dir, "dmn")
}

pub type Pending = BTreeMap<String, String>;

pub fn load_pending(dir: &Path) -> Result<Pending, String> {
    match std::fs::read_to_string(dir.join("pending.json")) {
        Ok(t) => serde_json::from_str(&t).map_err(|e| format!("pending.json: {e}")),
        Err(_) => Ok(Pending::new()),
    }
}

pub fn save_pending(dir: &Path, p: &Pending) -> Result<(), String> {
    let mut s = serde_json::to_string_pretty(p).map_err(|e| e.to_string())?;
    s.push('\n');
    std::fs::write(dir.join("pending.json"), s).map_err(|e| e.to_string())
}

#[derive(Debug, Default, PartialEq)]
pub struct Report {
    pub passed: usize,
    /// Failing and not pending.
    pub failed: Vec<String>,
    /// Failing and pending (allowed).
    pub pending: usize,
    /// Pending but passing: safe to delete from pending.json.
    pub removable: Vec<String>,
}

/// `outcomes` maps case id to "passed". Applies the pending rule.
pub fn classify(outcomes: &[(String, bool)], pending: &Pending) -> Report {
    let mut r = Report::default();
    for (id, ok) in outcomes {
        match (*ok, pending.contains_key(id)) {
            (true, false) => r.passed += 1,
            (true, true) => r.removable.push(id.clone()),
            (false, true) => r.pending += 1,
            (false, false) => r.failed.push(id.clone()),
        }
    }
    r
}

/// Runs all cases in `dir`.
pub fn run_all(dir: &Path) -> Result<Vec<(String, bool)>, String> {
    let mut out = vec![];
    for c in load_feel_cases(dir)? {
        let ok = std::panic::catch_unwind(|| {
            let actual = evaluate_feel(&c.expr, &c.context);
            actual.canonical_eq(&c.expected)
        })
        .unwrap_or(false);
        out.push((c.id, ok));
    }
    out.extend(
        load_bpmn_case_ids(dir)
            .into_iter()
            .map(|id| (id.clone(), run_bpmn_case(dir, &id))),
    );
    out.extend(
        load_form_case_ids(dir)
            .into_iter()
            .map(|id| (id.clone(), run_form_case(dir, &id))),
    );
    out.extend(
        load_dmn_case_ids(dir)
            .into_iter()
            .map(|id| (id.clone(), run_dmn_case(dir, &id))),
    );
    out.extend(
        eval_case_ids(dir)
            .into_iter()
            .map(|id| (id.clone(), run_dmn_eval_case(dir, &id))),
    );
    type Ids = fn(&Path) -> Vec<String>;
    type Check = fn(&Path, &str) -> Result<(), String>;
    let tooling: [(Ids, Check); 4] = [
        (lint::case_ids, lint::check_case),
        (optimize::case_ids, optimize::check_case),
        (compat::case_ids, compat::check_case),
        (migrate::case_ids, migrate::check_case),
    ];
    for (ids, check) in tooling {
        for id in ids(dir) {
            let ok = std::panic::catch_unwind(|| check(dir, &id).is_ok()).unwrap_or(false);
            out.push((id, ok));
        }
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn p(ids: &[&str]) -> Pending {
        ids.iter().map(|i| (i.to_string(), "r".into())).collect()
    }

    #[test]
    fn classify_applies_pending_rule() {
        let o = vec![
            ("a".to_string(), true),
            ("b".to_string(), false),
            ("c".to_string(), false),
            ("d".to_string(), true),
        ];
        let r = classify(&o, &p(&["c", "d"]));
        assert_eq!(r.passed, 1);
        assert_eq!(r.failed, vec!["b"]);
        assert_eq!(r.pending, 1);
        assert_eq!(r.removable, vec!["d"]);
    }

    #[test]
    fn missing_dir_is_empty() {
        let d = Path::new("/nonexistent-conformance");
        assert!(load_feel_cases(d).unwrap().is_empty());
        assert!(load_bpmn_case_ids(d).is_empty());
        assert!(load_form_case_ids(d).is_empty());
        assert!(load_dmn_case_ids(d).is_empty());
        assert!(load_pending(d).unwrap().is_empty());
    }
}
