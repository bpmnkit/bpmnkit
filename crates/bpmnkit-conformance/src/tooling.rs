//! Shared loading for the `lint/`, `optimize/`, `compat/` and `migrate/` cases
//! (format in conformance/README.md).

use serde_json::{Map, Value as Json};
use std::path::{Path, PathBuf};

/// One run of a tooling case.
pub struct Run {
    /// `<kind>/<case>/<run>`.
    pub id: String,
    pub input: PathBuf,
    pub options: Json,
    pub expected: PathBuf,
}

/// Every run of every case of `kind`, sorted by id.
pub fn runs(dir: &Path, kind: &str) -> Vec<Run> {
    let Ok(rd) = std::fs::read_dir(dir.join(kind)) else {
        return vec![];
    };
    let mut cases: Vec<PathBuf> = rd
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.is_dir())
        .collect();
    cases.sort();
    let mut out = vec![];
    for case in cases {
        let name = case
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        let spec: Json = std::fs::read_to_string(case.join("case.json"))
            .ok()
            .and_then(|t| serde_json::from_str(&t).ok())
            .unwrap_or(Json::Object(Map::new()));
        let input = match spec.get("input").and_then(Json::as_str) {
            Some(rel) => dir.join(rel),
            None => ["input.bpmn", "input.dmn", "input.form"]
                .iter()
                .map(|f| case.join(f))
                .find(|p| p.exists())
                .unwrap_or_else(|| case.join("input.bpmn")),
        };
        let runs = match spec.get("runs").and_then(Json::as_object) {
            Some(r) => r.clone(),
            None => Map::from_iter([("default".to_string(), Json::Object(Map::new()))]),
        };
        for (run, options) in runs {
            out.push(Run {
                id: format!("{kind}/{name}/{run}"),
                input: input.clone(),
                options,
                expected: case.join("expected").join(format!("{run}.json")),
            });
        }
    }
    out.sort_by(|a, b| a.id.cmp(&b.id));
    out
}

pub fn read(p: &Path) -> Result<String, String> {
    std::fs::read_to_string(p).map_err(|e| format!("{}: {e}", p.display()))
}

pub fn read_json(p: &Path) -> Result<Json, String> {
    serde_json::from_str(&read(p)?).map_err(|e| format!("{}: {e}", p.display()))
}

/// Structural JSON compare; names the first differing path.
pub fn json_diff(actual: &Json, expected: &Json) -> Result<(), String> {
    fn walk(a: &Json, e: &Json, path: &str) -> Result<(), String> {
        match (a, e) {
            (Json::Object(a), Json::Object(e)) => {
                for k in e.keys().chain(a.keys()) {
                    match (a.get(k), e.get(k)) {
                        (Some(x), Some(y)) => walk(x, y, &format!("{path}.{k}"))?,
                        (x, y) => return Err(format!("{path}.{k}: actual {x:?}, expected {y:?}")),
                    }
                }
                Ok(())
            }
            (Json::Array(a), Json::Array(e)) => {
                for (i, (x, y)) in a.iter().zip(e).enumerate() {
                    walk(x, y, &format!("{path}[{i}]"))?;
                }
                if a.len() != e.len() {
                    return Err(format!(
                        "{path}: length {} vs expected {}",
                        a.len(),
                        e.len()
                    ));
                }
                Ok(())
            }
            (Json::Number(x), Json::Number(y)) if x.as_f64() == y.as_f64() => Ok(()),
            _ if a == e => Ok(()),
            _ => Err(format!("{path}: actual {a}, expected {e}")),
        }
    }
    walk(actual, expected, "$")
}
