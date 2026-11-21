//! Zeebe's part of a connector task, for running a template without an engine
//! (`bpmnkit connector test`): input mappings evaluated with FEEL against the process variables,
//! and the job they produce.

use bpmnkit_feel::{Context, Value as Feel};
use bpmnkit_worker::ActivatedJob;
use serde_json::{Map, Value};

/// Evaluates `(target, source)` input mappings in order, as Zeebe does: `=…` is FEEL over the
/// variables plus the mappings before it, anything else is a literal string. A dotted target
/// (`authentication.type`) writes into a nested context.
pub fn evaluate_inputs(
    inputs: &[(String, String)],
    variables: &Map<String, Value>,
) -> Result<Map<String, Value>, String> {
    let mut out = Map::new();
    for (target, source) in inputs {
        let value = match source.trim_start().strip_prefix('=') {
            Some(expr) => {
                let mut ctx = Context::new();
                for (k, v) in variables.iter().chain(out.iter()) {
                    ctx.insert(k.clone(), Feel::from_json(v));
                }
                let v = bpmnkit_feel::evaluate(expr, &ctx)
                    .map_err(|e| format!("input '{target}': {e}"))?;
                v.to_json().unwrap_or(Value::Null)
            }
            None => Value::String(source.clone()),
        };
        insert_path(&mut out, target, value);
    }
    Ok(out)
}

fn insert_path(map: &mut Map<String, Value>, path: &str, value: Value) {
    match path.split_once('.') {
        None => {
            map.insert(path.to_owned(), value);
        }
        Some((head, rest)) => {
            let slot = map
                .entry(head.to_owned())
                .or_insert_with(|| Value::Object(Map::new()));
            if !slot.is_object() {
                *slot = Value::Object(Map::new());
            }
            if let Value::Object(inner) = slot {
                insert_path(inner, rest, value);
            }
        }
    }
}

/// A job as the engine would activate it for `job_type`.
pub fn job(
    job_type: &str,
    variables: Map<String, Value>,
    headers: Map<String, Value>,
    retries: i32,
) -> ActivatedJob {
    ActivatedJob {
        job_key: "1".into(),
        job_type: job_type.into(),
        element_id: "connector".into(),
        custom_headers: headers,
        retries,
        variables,
        ..ActivatedJob::default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn literal_feel_and_nested_targets() {
        let vars = json!({"city": "Berlin", "n": 2})
            .as_object()
            .unwrap()
            .clone();
        let inputs = [
            ("method".into(), "GET".into()),
            ("url".into(), "=\"https://x.test/\" + city".into()),
            ("authentication.type".into(), "bearer".into()),
            ("authentication.token".into(), "{{secrets.T}}".into()),
            ("queryParameters".into(), "={q: city, n: n + 1}".into()),
            ("echo".into(), "=url".into()),
        ];
        let out = evaluate_inputs(&inputs, &vars).unwrap();
        assert_eq!(
            Value::Object(out),
            json!({
                "method": "GET",
                "url": "https://x.test/Berlin",
                "authentication": {"type": "bearer", "token": "{{secrets.T}}"},
                "queryParameters": {"q": "Berlin", "n": 3},
                "echo": "https://x.test/Berlin",
            })
        );
        assert!(evaluate_inputs(&[("x".into(), "={".into())], &vars).is_err());
    }
}
