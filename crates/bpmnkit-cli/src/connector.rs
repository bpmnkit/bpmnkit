//! `connector run` and `connector test`: the local REST connector runner
//! (`bpmnkit-connector-runtime`, plan §7). `gen` / `bind` live in `native.rs`.

use std::collections::BTreeSet;
use std::path::{Path, PathBuf};

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_connector_runtime::{
    command_json, mapping, run_job_blocking, HttpJsonConnector, Options, Secrets, HTTP_JSON,
};
use bpmnkit_connectors::{
    apply_template_to_element, get_template, ApplyToModelOptions, ElementTemplate,
};
use bpmnkit_worker::Command;
use clap::Args;
use serde_json::{Map, Value};

#[derive(Args)]
pub struct ConnectorRunArgs {
    /// Also serve the job types of the templates in this directory (*.json)
    #[arg(long)]
    pub templates: Option<PathBuf>,
    /// Also serve this job type (a private type bound to the REST connector); repeatable
    #[arg(long = "as", value_name = "TYPE")]
    pub job_types: Vec<String>,
    /// Fail jobs whose response body is larger than this
    #[arg(long)]
    pub max_response_bytes: Option<usize>,
}

#[derive(Args)]
pub struct ConnectorTestArgs {
    /// Element template .json (one template, or an array with --id), or a bundled template id
    pub template: String,
    /// Process variables the input mappings see (a JSON object)
    #[arg(long)]
    pub vars: Option<PathBuf>,
    /// Template id to pick from an array file
    #[arg(long)]
    pub id: Option<String>,
    /// Template property values, `key=value` (repeatable), as for `connector bind`
    #[arg(long = "set", value_name = "KEY=VALUE")]
    pub set: Vec<String>,
    /// Retries the job starts with
    #[arg(long, default_value_t = 3)]
    pub retries: i32,
    #[arg(long)]
    pub max_response_bytes: Option<usize>,
}

fn fail(msg: &str) -> i32 {
    eprintln!("Error: {msg}");
    1
}

fn connector(max: Option<usize>) -> HttpJsonConnector {
    HttpJsonConnector::new(Secrets::from_env()).options(Options {
        max_response_bytes: max,
    })
}

/// The `zeebe:taskDefinition` type a template binds.
fn template_type(t: &ElementTemplate) -> Option<String> {
    t.properties.iter().find_map(|p| {
        let b = &p.binding;
        let is_type = b.kind == "zeebe:taskDefinition"
            && (b.property.as_deref() == Some("type") || b.name.as_deref() == Some("type"))
            || b.kind == "zeebe:taskDefinition:type";
        match (&p.value, is_type) {
            (Some(Value::String(s)), true) => Some(s.clone()),
            _ => None,
        }
    })
}

fn read_templates(text: &str) -> Result<Vec<ElementTemplate>, String> {
    let v: Value = serde_json::from_str(text).map_err(|e| e.to_string())?;
    let items = match v {
        Value::Array(a) => a,
        one => vec![one],
    };
    items
        .iter()
        .map(|t| ElementTemplate::from_value(t).map_err(|e| e.to_string()))
        .collect()
}

pub fn run(a: ConnectorRunArgs) -> i32 {
    let mut types = BTreeSet::from([HTTP_JSON.to_owned()]);
    types.extend(a.job_types.iter().cloned());
    if let Some(dir) = &a.templates {
        match template_dir_types(dir) {
            Ok(t) => types.extend(t),
            Err(e) => return fail(&e),
        }
    }
    let types: Vec<String> = types.into_iter().collect();
    eprintln!("→ Serving {} (Ctrl-C to stop)", types.join(", "));
    match bpmnkit_connector_runtime::serve_blocking(connector(a.max_response_bytes), &types) {
        Ok(()) => 0,
        Err(e) => fail(&e.to_string()),
    }
}

fn template_dir_types(dir: &Path) -> Result<BTreeSet<String>, String> {
    let mut out = BTreeSet::new();
    let entries = std::fs::read_dir(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().is_none_or(|x| x != "json") {
            continue;
        }
        let text =
            std::fs::read_to_string(&path).map_err(|e| format!("{}: {e}", path.display()))?;
        for t in read_templates(&text).map_err(|e| format!("{}: {e}", path.display()))? {
            out.extend(template_type(&t));
        }
    }
    Ok(out)
}

const TASK_XML: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="http://bpmnkit.com/connector-test">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:serviceTask id="connector" />
  </bpmn:process>
</bpmn:definitions>"#;

/// Binds the template onto a lone service task and reads back what the engine would see:
/// job type, input mappings and task headers.
fn job_shape(
    template: &ElementTemplate,
    values: &indexmap::IndexMap<String, String>,
) -> Result<bpmnkit_jobspec::JobSpec, String> {
    let defs = parse_bpmn(TASK_XML).map_err(|e| e.to_string())?;
    let options = ApplyToModelOptions {
        validate: false,
        ..ApplyToModelOptions::default()
    };
    let bound = apply_template_to_element(&defs, "connector", template, values, &options);
    if let Some(p) = bound
        .problems
        .iter()
        .find(|p| p.kind.is_none() && p.key.is_none())
    {
        return Err(p.message.clone());
    }
    let project = bpmnkit_jobspec::extract("connector-test", &[bound.definitions]).project;
    project
        .jobs
        .into_values()
        .next()
        .ok_or_else(|| format!("template \"{}\" binds no job type", template.id))
}

pub fn test(a: ConnectorTestArgs) -> i32 {
    let template = match pick_template(&a) {
        Ok(t) => t,
        Err(e) => return fail(&e),
    };
    let mut values = indexmap::IndexMap::new();
    for kv in &a.set {
        let Some((k, v)) = kv.split_once('=') else {
            return fail(&format!("--set expects key=value, got \"{kv}\""));
        };
        values.insert(k.to_owned(), v.to_owned());
    }
    let vars: Map<String, Value> = match &a.vars {
        None => Map::new(),
        Some(p) => match std::fs::read_to_string(p)
            .map_err(|e| e.to_string())
            .and_then(|t| serde_json::from_str::<Value>(&t).map_err(|e| e.to_string()))
        {
            Ok(Value::Object(m)) => m,
            Ok(_) => return fail(&format!("{}: must be a JSON object", p.display())),
            Err(e) => return fail(&format!("{}: {e}", p.display())),
        },
    };
    let spec = match job_shape(&template, &values) {
        Ok(s) => s,
        Err(e) => return fail(&e),
    };
    let inputs: Vec<(String, String)> = spec
        .inputs
        .iter()
        .map(|m| (m.target.clone(), m.source.clone()))
        .collect();
    let local = match mapping::evaluate_inputs(&inputs, &vars) {
        Ok(l) => l,
        Err(e) => return fail(&e),
    };
    // Job variables: the process variables, shadowed by the task's local input variables.
    let mut job_vars = vars;
    job_vars.extend(local);
    let headers: Map<String, Value> = spec
        .headers
        .iter()
        .filter_map(|h| Some((h.key.clone(), Value::String(h.values.first()?.clone()))))
        .collect();
    let job = mapping::job(&spec.job_type, job_vars, headers, a.retries);
    let command = run_job_blocking(&connector(a.max_response_bytes), &job);
    println!(
        "{}",
        serde_json::to_string_pretty(&command_json(&command)).unwrap_or_default()
    );
    i32::from(!matches!(command, Command::Complete(_)))
}

fn pick_template(a: &ConnectorTestArgs) -> Result<ElementTemplate, String> {
    if !Path::new(&a.template).exists() {
        return get_template(&a.template).cloned().ok_or_else(|| {
            format!(
                "\"{}\" is neither a template file nor a bundled template id",
                a.template
            )
        });
    }
    let text = std::fs::read_to_string(&a.template).map_err(|e| format!("{}: {e}", a.template))?;
    let mut all = read_templates(&text).map_err(|e| format!("{}: {e}", a.template))?;
    match &a.id {
        Some(id) => all
            .into_iter()
            .find(|t| &t.id == id)
            .ok_or_else(|| format!("no template \"{id}\" in {}", a.template)),
        None if all.len() == 1 => Ok(all.remove(0)),
        None => Err(format!(
            "{} holds {} templates; pick one with --id",
            a.template,
            all.len()
        )),
    }
}
