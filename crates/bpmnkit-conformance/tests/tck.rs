//! Runs the DMN TCK FEEL cases against bpmnkit-feel, as
//! `packages/feel/tests/tck.test.ts` does for TS. The cases are extracted from
//! a dmn-tck checkout and not committed:
//!
//! ```sh
//! node packages/feel/tasks/extract-tck-tests.mjs --tck ../dmn-tck
//! cargo test -p bpmnkit-conformance --test tck -- --ignored --nocapture
//! ```

use bpmnkit_feel::{evaluate, Context, Decimal, Value};
use serde::Deserialize;
use std::path::Path;

#[derive(Deserialize)]
struct Suite {
    name: String,
    cases: Vec<Case>,
}

#[derive(Deserialize)]
struct Case {
    id: String,
    context: Option<String>,
    expression: String,
    expected: String,
}

/// Same tolerance as the TS runner: relative 1e-9 (the TCK records some
/// results at its own precision, e.g. exp(4) as 54.59815003).
fn matches(actual: &Value, expected: &Value) -> bool {
    match (actual, expected) {
        (Value::Number(a), Value::Number(b)) => {
            let scale = a.abs().max(b.abs()).max(Decimal::ONE);
            (a - b).abs() / scale < Decimal::new(1, 9)
        }
        (Value::List(a), Value::List(b)) => {
            a.len() == b.len() && a.iter().zip(b).all(|(x, y)| matches(x, y))
        }
        (Value::Context(a), Value::Context(b)) => {
            a.len() == b.len()
                && a.iter()
                    .all(|(k, x)| b.get(k).is_some_and(|y| matches(x, y)))
        }
        _ => actual == expected,
    }
}

fn run(case: &Case) -> Result<bool, String> {
    let vars = match &case.context {
        Some(c) => match evaluate(c, &Context::new()).map_err(|e| e.to_string())? {
            Value::Context(ctx) => ctx,
            _ => Context::new(),
        },
        None => Context::new(),
    };
    let expected = evaluate(&case.expected, &Context::new()).map_err(|e| e.to_string())?;
    let actual = evaluate(&case.expression, &vars).map_err(|e| e.to_string())?;
    Ok(matches(&actual, &expected))
}

#[test]
#[ignore = "needs the extracted DMN TCK (see module docs)"]
fn tck() {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../packages/feel/tests/tck");
    let Ok(rd) = std::fs::read_dir(&dir) else {
        println!("TCK not extracted: {}", dir.display());
        return;
    };
    let mut files: Vec<_> = rd.filter_map(|e| e.ok().map(|e| e.path())).collect();
    files.sort();
    let (mut passed, mut total) = (0usize, 0usize);
    let mut failed = vec![];
    for f in files.iter().filter(|p| p.extension().is_some_and(|x| x == "json")) {
        let suite: Suite = serde_json::from_str(&std::fs::read_to_string(f).unwrap()).unwrap();
        for case in &suite.cases {
            total += 1;
            let ok = std::panic::catch_unwind(|| run(case)).unwrap_or(Ok(false));
            if ok == Ok(true) {
                passed += 1;
            } else {
                failed.push(format!("{}/{}", suite.name, case.id));
            }
        }
    }
    if let Ok(out) = std::env::var("TCK_FAILURES_OUT") {
        std::fs::write(out, failed.join("\n")).unwrap();
    }
    println!(
        "TCK: {passed}/{total} passed ({:.1}%)",
        100.0 * passed as f64 / total.max(1) as f64
    );
}
