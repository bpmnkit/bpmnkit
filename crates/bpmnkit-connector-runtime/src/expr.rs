//! `resultExpression` / `errorExpression` in FEEL (bpmnkit-feel), with the connector SDK's
//! `bpmnError`, `jobError` and `ignoreError` functions in scope.

use std::time::Duration;

use bpmnkit_feel::{Context, Decimal, Function, Value as Feel};
use bpmnkit_worker::parse_iso8601_duration;
use serde_json::{Map, Value};

/// What an `errorExpression` asked for.
#[derive(Clone, Debug, PartialEq)]
pub enum ErrorOutcome {
    Bpmn {
        code: String,
        message: Option<String>,
        variables: Option<Map<String, Value>>,
    },
    Job {
        message: String,
        variables: Option<Map<String, Value>>,
        retries: Option<i32>,
        retry_backoff: Option<Duration>,
    },
    /// Complete the job with these variables instead of failing it.
    Ignore(Option<Map<String, Value>>),
}

const MARK: &str = "__bpmnkitErrorType";

fn marker(kind: &str, fields: Vec<(&str, Feel)>) -> Feel {
    let mut c = Context::new();
    c.insert(MARK, Feel::String(kind.into()));
    for (k, v) in fields {
        c.insert(k, v);
    }
    Feel::Context(c)
}

fn arg(args: &[Feel], i: usize) -> Feel {
    args.get(i).cloned().unwrap_or_default()
}

fn functions(ctx: &mut Context) {
    let params = |p: &[&str]| Some(p.iter().map(|s| (*s).to_owned()).collect());
    ctx.insert(
        "bpmnError",
        Feel::Function(Function::new(
            params(&["code", "message", "variables"]),
            |a| {
                marker(
                    "bpmnError",
                    vec![
                        ("code", arg(a, 0)),
                        ("message", arg(a, 1)),
                        ("variables", arg(a, 2)),
                    ],
                )
            },
        )),
    );
    ctx.insert(
        "jobError",
        Feel::Function(Function::new(
            params(&["message", "variables", "retries", "retryBackoff"]),
            |a| {
                marker(
                    "jobError",
                    vec![
                        ("message", arg(a, 0)),
                        ("variables", arg(a, 1)),
                        ("retries", arg(a, 2)),
                        ("retryBackoff", arg(a, 3)),
                    ],
                )
            },
        )),
    );
    ctx.insert(
        "ignoreError",
        Feel::Function(Function::new(params(&["variables"]), |a| {
            marker("ignoreError", vec![("variables", arg(a, 0))])
        })),
    );
}

/// `=`-prefixed or bare FEEL source; blank = absent.
pub fn source(expr: &str) -> Option<&str> {
    let s = expr.trim();
    let s = s.strip_prefix('=').unwrap_or(s).trim();
    (!s.is_empty()).then_some(s)
}

fn context(scope: &[(&str, &Value)]) -> Context {
    let mut ctx = Context::new();
    functions(&mut ctx);
    for (k, v) in scope {
        ctx.insert(*k, Feel::from_json(v));
    }
    ctx
}

fn eval(expr: &str, scope: &[(&str, &Value)], what: &str) -> Result<Feel, String> {
    let Some(src) = source(expr) else {
        return Ok(Feel::Null);
    };
    bpmnkit_feel::evaluate(src, &context(scope)).map_err(|e| format!("invalid {what}: {e}"))
}

fn json_map(v: &Feel) -> Option<Map<String, Value>> {
    match v.to_json()? {
        Value::Object(m) => Some(m),
        _ => None,
    }
}

fn string(v: &Feel) -> Option<String> {
    match v {
        Feel::Null => None,
        Feel::String(s) => Some(s.clone()),
        other => other.to_feel_string(),
    }
}

fn duration(v: &Feel) -> Option<Duration> {
    match v {
        Feel::DaysTimeDuration(d) => {
            let ms: Decimal = d.seconds * Decimal::from(1000);
            ms.trunc()
                .to_string()
                .parse::<u64>()
                .ok()
                .map(Duration::from_millis)
        }
        Feel::String(s) => parse_iso8601_duration(s),
        _ => None,
    }
}

/// Evaluates `errorExpression`; `Ok(None)` when it is absent or yields anything but one of the
/// three error functions' results.
pub fn error_outcome(expr: &str, scope: &[(&str, &Value)]) -> Result<Option<ErrorOutcome>, String> {
    let Feel::Context(c) = eval(expr, scope, "errorExpression")? else {
        return Ok(None);
    };
    let field = |k: &str| c.get(k).cloned().unwrap_or_default();
    Ok(match c.get(MARK) {
        Some(Feel::String(kind)) if kind == "bpmnError" => match string(&field("code")) {
            Some(code) if !code.is_empty() => Some(ErrorOutcome::Bpmn {
                code,
                message: string(&field("message")),
                variables: json_map(&field("variables")),
            }),
            _ => return Err("bpmnError requires a non-empty error code".into()),
        },
        Some(Feel::String(kind)) if kind == "jobError" => Some(ErrorOutcome::Job {
            message: string(&field("message")).unwrap_or_default(),
            variables: json_map(&field("variables")),
            retries: match field("retries") {
                Feel::Number(n) => n.trunc().to_string().parse::<i32>().ok(),
                _ => None,
            },
            retry_backoff: duration(&field("retryBackoff")),
        }),
        Some(Feel::String(kind)) if kind == "ignoreError" => {
            Some(ErrorOutcome::Ignore(json_map(&field("variables"))))
        }
        _ => None,
    })
}

/// Evaluates `resultExpression` to the variables to merge; it must yield a context (or null).
pub fn result_variables(
    expr: &str,
    scope: &[(&str, &Value)],
) -> Result<Option<Map<String, Value>>, String> {
    match eval(expr, scope, "resultExpression")? {
        Feel::Null => Ok(None),
        v @ Feel::Context(_) => json_map(&v)
            .map(Some)
            .ok_or_else(|| "resultExpression yields a value JSON cannot hold".into()),
        other => Err(format!(
            "resultExpression must yield a context, got {}",
            other.type_name()
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn result_expression_reads_response() {
        let r = json!({"status": 200, "body": {"id": 7, "items": [1, 2]}});
        let v = result_variables(
            "={id: response.body.id, n: count(response.body.items)}",
            &[("response", &r)],
        )
        .unwrap();
        assert_eq!(Value::Object(v.unwrap()), json!({"id": 7, "n": 2}));
        assert_eq!(result_variables("  ", &[]).unwrap(), None);
        assert!(result_variables("=1", &[]).unwrap_err().contains("context"));
        assert!(result_variables("={a:", &[])
            .unwrap_err()
            .starts_with("invalid resultExpression"));
    }

    #[test]
    fn error_functions() {
        let e = json!({"code": "404", "message": "Not Found"});
        let x = r#"=if error.code = "404" then bpmnError("NOT_FOUND", "gone", {a: 1}) else null"#;
        assert_eq!(
            error_outcome(x, &[("error", &e)]).unwrap(),
            Some(ErrorOutcome::Bpmn {
                code: "NOT_FOUND".into(),
                message: Some("gone".into()),
                variables: Some(json!({"a": 1}).as_object().unwrap().clone())
            })
        );
        let x = r#"jobError("later", {}, 0, @"PT30S")"#;
        assert_eq!(
            error_outcome(x, &[]).unwrap(),
            Some(ErrorOutcome::Job {
                message: "later".into(),
                variables: Some(Map::new()),
                retries: Some(0),
                retry_backoff: Some(Duration::from_secs(30))
            })
        );
        assert_eq!(
            error_outcome(r#"ignoreError({created: true})"#, &[]).unwrap(),
            Some(ErrorOutcome::Ignore(Some(
                json!({"created": true}).as_object().unwrap().clone()
            )))
        );
        assert_eq!(error_outcome("=null", &[]).unwrap(), None);
        assert_eq!(error_outcome("={code: \"x\"}", &[]).unwrap(), None);
        assert!(error_outcome("=bpmnError(\"\", \"m\")", &[]).is_err());
    }

    #[test]
    fn null_error_on_success_takes_else_branch() {
        let r = json!({"status": 200, "body": {"status": "failed"}});
        let x = r#"=if error.code = "500" then bpmnError("500", "x") else if response.body.status = "failed" then bpmnError("FAILED", "Action failed", response.body) else null"#;
        let out = error_outcome(x, &[("response", &r), ("error", &Value::Null)]).unwrap();
        assert!(matches!(out, Some(ErrorOutcome::Bpmn { code, .. }) if code == "FAILED"));
    }
}
