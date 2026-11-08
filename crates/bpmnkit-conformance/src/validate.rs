//! `validate/` cases and the Zeebe agreement corpus (conformance/README.md, "Validate").

use crate::sha256::sha256_hex;
use crate::tooling;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_compat::zeebe::{
    is_deployable, validate_deployable_xml, ValidateOptions, ZeebeLimits, ZeebeResolver,
};
use bpmnkit_compat::Finding;
use serde_json::{json, Value as Json};
use std::path::Path;

/// Ids of every `validate/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    tooling::runs(dir, "validate")
        .into_iter()
        .map(|r| r.id)
        .collect()
}

/// `deployment` in a run's options: the ids of the other resources.
struct Deployment(Json);

impl Deployment {
    fn has(&self, key: &str, id: &str) -> Option<bool> {
        Some(
            self.0
                .get(key)
                .and_then(Json::as_array)
                .is_some_and(|ids| ids.iter().any(|v| v.as_str() == Some(id))),
        )
    }
}

impl ZeebeResolver for Deployment {
    fn has_process(&self, id: &str) -> Option<bool> {
        self.has("processes", id)
    }
    fn has_decision(&self, id: &str) -> Option<bool> {
        self.has("decisions", id)
    }
    fn has_form(&self, id: &str) -> Option<bool> {
        self.has("forms", id)
    }
    fn has_resource(&self, id: &str) -> Option<bool> {
        self.has("resources", id)
    }
}

fn limits(options: &Json) -> ZeebeLimits {
    let mut l = ZeebeLimits::default();
    let get = |k: &str| {
        options
            .get("limits")
            .and_then(|v| v.get(k))
            .and_then(Json::as_u64)
            .map(|n| n as usize)
    };
    if let Some(n) = get("maxIdLength") {
        l.max_id_length = n;
    }
    if let Some(n) = get("maxNameLength") {
        l.max_name_length = n;
    }
    if let Some(n) = get("maxWorkerTypeLength") {
        l.max_worker_type_length = n;
    }
    l
}

/// `validateDeployableXml(xml, options(run))`, as the TS recorder calls it.
pub fn validate(input: &str, options: &Json) -> Vec<Finding> {
    reset_id_counter();
    let deployment = options.get("deployment").cloned().map(Deployment);
    let opts = ValidateOptions {
        camunda_version: options
            .get("camundaVersion")
            .and_then(Json::as_str)
            .map(str::to_string),
        resolver: deployment.as_ref().map(|d| d as &dyn ZeebeResolver),
        limits: limits(options),
    };
    validate_deployable_xml(input, &opts)
}

fn finding_json(f: &Finding) -> Json {
    let mut v = serde_json::to_value(&f.data).unwrap_or(Json::Null);
    if let Json::Object(m) = &mut v {
        m.insert("fixable".into(), Json::Bool(f.fixable()));
    }
    v
}

/// What the recorder writes for one run: `{"findings": [...]}`.
pub fn run_case(input: &str, options: &Json) -> Json {
    let findings: Vec<Json> = validate(input, options).iter().map(finding_json).collect();
    json!({ "findings": findings })
}

/// Checks one run; `Err` says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let run = tooling::runs(dir, "validate")
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let actual = run_case(&tooling::read(&run.input)?, &run.options);
    tooling::json_diff(&actual, &tooling::read_json(&run.expected)?)
}

/// What zeebe-check runs with: Zeebe 8.9, 255-character limits.
pub fn oracle_options() -> Json {
    json!({
        "camundaVersion": "8.9",
        "limits": { "maxIdLength": 255, "maxNameLength": 255, "maxWorkerTypeLength": 255 }
    })
}

/// The agreement of the validator with Zeebe's recorded verdicts.
pub struct Agreement {
    pub compared: usize,
    pub stale: usize,
    /// `file: why`, for every undocumented disagreement.
    pub disagree: Vec<String>,
}

/// Compares `validate_deployable_xml` with every fresh verdict in `validate/zeebe-verdicts.json`,
/// leaving out the files `validate/undecidable.json` documents.
pub fn agreement(dir: &Path) -> Result<Agreement, String> {
    let verdicts = tooling::read_json(&dir.join("validate/zeebe-verdicts.json"))?;
    let undecidable = tooling::read_json(&dir.join("validate/undecidable.json"))?;
    let repo = dir.join("..");
    let oracle = oracle_options();
    let mut out = Agreement {
        compared: 0,
        stale: 0,
        disagree: vec![],
    };
    let files = verdicts
        .get("files")
        .and_then(Json::as_object)
        .ok_or("zeebe-verdicts.json has no files")?;
    for (file, verdict) in files {
        let Ok(bytes) = std::fs::read(repo.join(file)) else {
            continue;
        };
        if verdict.get("sha256").and_then(Json::as_str) != Some(sha256_hex(&bytes).as_str()) {
            out.stale += 1;
            continue;
        }
        out.compared += 1;
        let ok = verdict.get("ok").and_then(Json::as_bool).unwrap_or(false);
        let findings = validate(&String::from_utf8_lossy(&bytes), &oracle);
        let ours = is_deployable(&findings);
        if ours != ok && undecidable["files"].get(file).is_none() {
            let first = findings
                .iter()
                .find(|f| f.data.severity == bpmnkit_compat::Severity::Error)
                .map(|f| f.data.message.clone())
                .unwrap_or_default();
            out.disagree.push(format!(
                "{file}: zeebe {}, ours {} {first}",
                if ok { "OK" } else { "FAIL" },
                if ours { "OK" } else { "FAIL" }
            ));
        }
    }
    Ok(out)
}
