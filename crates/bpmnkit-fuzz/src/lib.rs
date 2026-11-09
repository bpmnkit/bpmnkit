//! Differential fuzzing (doc/rust-rewrite-proposal.md §4.4). Proptest generates inputs per
//! [`Target`]; each input is a JSON request that [`run`] answers with the Rust crates and
//! `scripts/fuzz/oracle.mjs` answers with the TypeScript packages, in the same shape.
//! [`compare`] is the conformance suite's comparison, so a mismatch here is a conformance case.

pub mod gen;
pub mod oracle;

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_conformance::{evaluate_feel, first_diff_line, from_feel, json_diff, to_feel, Value};
use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use bpmnkit_form::{export_form, parse_form};
use bpmnkit_text::compact::{compactify, expand, ExpandOptions};
use bpmnkit_text::process_text::parse_process_text;
use serde_json::{json, Value as Json};
use std::collections::BTreeMap;

/// What one fuzz target feeds both implementations.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Target {
    /// `{expr, context}` → `{value}`.
    Feel,
    /// `{xml}` → `{model, xml}` (parse, then serialize) or `{error}`.
    Bpmn,
    /// `{xml}` → `{model, xml}` or `{error}`.
    Dmn,
    /// `{xml, decision, context}` → `{result, evaluated}` or `{error}`.
    DmnEval,
    /// `{json}` → `{model, text}` or `{error}`.
    Form,
    /// `{text}` → `{result, xml}` (parse process text, then expand) or `{result, expandError}`.
    Text,
    /// `{xml}` → `{compact, expanded}` (compactify, then expand) or `{compact, expandError}`.
    Compact,
}

impl Target {
    pub const ALL: [Target; 7] = [
        Target::Feel,
        Target::Bpmn,
        Target::Dmn,
        Target::DmnEval,
        Target::Form,
        Target::Text,
        Target::Compact,
    ];

    pub fn name(self) -> &'static str {
        match self {
            Target::Feel => "feel",
            Target::Bpmn => "bpmn",
            Target::Dmn => "dmn",
            Target::DmnEval => "dmn-eval",
            Target::Form => "form",
            Target::Text => "text",
            Target::Compact => "compact",
        }
    }

    pub fn from_name(name: &str) -> Option<Target> {
        Target::ALL.into_iter().find(|t| t.name() == name)
    }
}

fn str_field<'a>(req: &'a Json, key: &str) -> &'a str {
    req.get(key).and_then(Json::as_str).unwrap_or("")
}

fn feel_context(req: &Json) -> BTreeMap<String, Value> {
    req.get("context")
        .cloned()
        .and_then(|c| serde_json::from_value(c).ok())
        .unwrap_or_default()
}

fn to_json<T: serde::Serialize>(v: &T) -> Json {
    serde_json::to_value(v).unwrap_or(Json::Null)
}

fn run_unguarded(target: Target, req: &Json) -> Json {
    match target {
        Target::Feel => {
            let v = evaluate_feel(str_field(req, "expr"), &feel_context(req));
            json!({ "value": to_json(&v) })
        }
        Target::Bpmn => match parse_bpmn(str_field(req, "xml")) {
            Ok(defs) => json!({ "model": to_json(&defs), "xml": serialize_bpmn(&defs) }),
            Err(e) => json!({ "error": e.to_string() }),
        },
        Target::Dmn => match parse_dmn(str_field(req, "xml")) {
            Ok(defs) => json!({ "model": to_json(&defs), "xml": serialize_dmn(&defs) }),
            Err(e) => json!({ "error": e.0 }),
        },
        Target::DmnEval => {
            let defs = match parse_dmn(str_field(req, "xml")) {
                Ok(d) => d,
                Err(e) => return json!({ "error": e.0 }),
            };
            let mut ctx = bpmnkit_feel::Context::new();
            for (k, v) in feel_context(req) {
                ctx.insert(k, to_feel(&v).unwrap_or(bpmnkit_feel::Value::Null));
            }
            match bpmnkit_dmn::evaluate_decision_graph(&defs, str_field(req, "decision"), &ctx) {
                Ok(r) => json!({
                    "result": to_json(&from_feel(&r.result)),
                    "evaluated": r.evaluated_decisions.iter().map(|d| json!({
                        "decision": d.decision_id,
                        "result": to_json(&from_feel(&d.result)),
                    })).collect::<Vec<_>>(),
                }),
                Err(e) => json!({ "error": e.to_string() }),
            }
        }
        Target::Form => match parse_form(str_field(req, "json")) {
            Ok(form) => json!({ "model": to_json(&form), "text": export_form(&form) }),
            Err(e) => json!({ "error": e.to_string() }),
        },
        Target::Text => {
            reset_id_counter();
            let result = parse_process_text(str_field(req, "text"));
            reset_id_counter();
            // Ungated, here and in the oracle: the target is the expansion; random text is
            // rarely a deployable model, and the deploy check has its own conformance cases.
            match expand(&result.diagram, &ExpandOptions::ungated()) {
                Ok(defs) => json!({ "result": to_json(&result), "xml": serialize_bpmn(&defs) }),
                Err(e) => json!({ "result": to_json(&result), "expandError": e.message }),
            }
        }
        Target::Compact => {
            reset_id_counter();
            let defs = match parse_bpmn(str_field(req, "xml")) {
                Ok(d) => d,
                Err(e) => return json!({ "error": e.to_string() }),
            };
            let compact = compactify(&defs);
            reset_id_counter();
            match expand(&compact, &ExpandOptions::ungated()) {
                Ok(out) => {
                    json!({ "compact": to_json(&compact), "expanded": serialize_bpmn(&out) })
                }
                Err(e) => json!({ "compact": to_json(&compact), "expandError": e.message }),
            }
        }
    }
}

/// Answers `req` with the Rust crates. A panic becomes `{"panic": message}`, which never
/// matches the oracle, so it is reported like any other mismatch.
pub fn run(target: Target, req: &Json) -> Json {
    std::panic::catch_unwind(|| run_unguarded(target, req))
        .unwrap_or_else(|p| json!({ "panic": bpmnkit_conformance::panic_message(p.as_ref()) }))
}

/// Numbers equal up to float64 noise. The conformance rule (equal after rounding to 15
/// digits) is right for recorded cases but not for arbitrary ones: TS computes in float64, so
/// `3.14159 ** 15` carries an error in the 15th digit that Rust's exact decimals do not, and TS
/// prints at most 20 fraction digits. Both are the documented number model, not defects.
fn close(a: &str, b: &str) -> bool {
    if bpmnkit_conformance::decimal_eq(a, b) {
        return true;
    }
    match (a.parse::<f64>(), b.parse::<f64>()) {
        (Ok(x), Ok(y)) => {
            let d = (x - y).abs();
            d <= 1e-12 * x.abs().max(y.abs()) || d < 1e-18
        }
        _ => false,
    }
}

/// Temporal strings compared with their numbers (seconds of a duration) by [`close`].
fn close_text(a: &str, b: &str) -> bool {
    let split = |s: &str| -> Vec<String> {
        let mut parts = vec![];
        let mut cur = String::new();
        let mut numeric = false;
        for ch in s.chars() {
            let is_num = ch.is_ascii_digit() || ch == '.';
            if is_num != numeric && !cur.is_empty() {
                parts.push(std::mem::take(&mut cur));
            }
            numeric = is_num;
            cur.push(ch);
        }
        parts.push(cur);
        parts
    };
    let (x, y) = (split(a), split(b));
    x.len() == y.len()
        && x.iter()
            .zip(&y)
            .all(|(p, q)| p == q || (p.starts_with(|c: char| c.is_ascii_digit()) && close(p, q)))
}

/// `[-]P[nD][T[nH][nM][n.nS]]` as seconds.
fn duration_seconds(s: &str) -> Option<f64> {
    let (sign, rest) = match s.strip_prefix('-') {
        Some(r) => (-1.0, r),
        None => (1.0, s),
    };
    let mut total = 0.0;
    let mut num = String::new();
    for ch in rest.strip_prefix('P')?.chars() {
        match ch {
            'T' => {}
            'D' | 'H' | 'M' | 'S' => {
                let unit = match ch {
                    'D' => 86_400.0,
                    'H' => 3_600.0,
                    'M' => 60.0,
                    _ => 1.0,
                };
                total += num.parse::<f64>().ok()? * unit;
                num.clear();
            }
            c => num.push(c),
        }
    }
    num.is_empty().then_some(sign * total)
}

fn value_close(a: &Value, b: &Value) -> bool {
    use Value::*;
    match (a, b) {
        (Number(x), Number(y)) => close(x, y),
        // Past rust_decimal's range only float64 has a value; Rust's null is its number model.
        (Number(x), Null) | (Null, Number(x)) => x.parse::<f64>().is_ok_and(|f| f.abs() >= 7.9e28),
        (DaysTimeDuration(x), DaysTimeDuration(y)) => {
            x == y
                || duration_seconds(x)
                    .zip(duration_seconds(y))
                    .is_some_and(|(p, q)| close(&p.to_string(), &q.to_string()))
        }
        // `string(2 ** 0.5)` prints every digit each side has: float64's 17 or 28 decimals.
        (String(x), String(y)) | (Time(x), Time(y)) | (DateTime(x), DateTime(y)) => {
            close_text(x, y)
        }
        (List(x), List(y)) => x.len() == y.len() && x.iter().zip(y).all(|(p, q)| value_close(p, q)),
        (Context(x), Context(y)) => {
            x.len() == y.len()
                && x.iter()
                    .all(|(k, p)| y.get(k).is_some_and(|q| value_close(p, q)))
        }
        _ => a == b,
    }
}

fn feel_eq(a: &Json, b: &Json) -> bool {
    match (
        serde_json::from_value::<Value>(a.clone()),
        serde_json::from_value::<Value>(b.clone()),
    ) {
        (Ok(x), Ok(y)) => value_close(&x, &y),
        _ => a == b,
    }
}

/// A form whose text is not JSON fails in both, but the detail after this prefix is the
/// platform parser's own wording (V8's `JSON.parse`, serde_json), which neither side controls.
const FORM_JSON_ERROR: &str = "Failed to parse form JSON: ";

/// `Ok` when the two answers agree as the conformance suite would judge them: FEEL values by
/// [`Value::canonical_eq`], everything else by [`json_diff`] (numbers by value, keys unordered).
pub fn compare(target: Target, rust: &Json, ts: &Json) -> Result<(), String> {
    if let Some(p) = rust.get("panic") {
        return Err(format!("rust panicked: {p}"));
    }
    if let Some(e) = ts.get("crash") {
        return Err(format!("ts threw outside its contract: {e}"));
    }
    match target {
        Target::Feel => feel_eq(&rust["value"], &ts["value"])
            .then_some(())
            .ok_or_else(|| format!("value {} != {}", rust["value"], ts["value"])),
        Target::DmnEval if rust.get("result").is_some() && ts.get("result").is_some() => {
            if !feel_eq(&rust["result"], &ts["result"]) {
                return Err(format!("result {} != {}", rust["result"], ts["result"]));
            }
            let (r, t) = (&rust["evaluated"], &ts["evaluated"]);
            let (Some(r), Some(t)) = (r.as_array(), t.as_array()) else {
                return Err("evaluated is not a list".into());
            };
            let ids = |l: &[Json]| l.iter().map(|d| d["decision"].clone()).collect::<Vec<_>>();
            if ids(r) != ids(t) {
                return Err(format!("evaluated {:?} != {:?}", ids(r), ids(t)));
            }
            match r
                .iter()
                .zip(t)
                .find(|(x, y)| !feel_eq(&x["result"], &y["result"]))
            {
                Some((x, y)) => Err(format!(
                    "{} {} != {}",
                    x["decision"], x["result"], y["result"]
                )),
                None => Ok(()),
            }
        }
        Target::Form
            if [rust, ts].iter().all(|a| {
                a.get("error")
                    .and_then(Json::as_str)
                    .is_some_and(|e| e.starts_with(FORM_JSON_ERROR))
            }) =>
        {
            Ok(())
        }
        _ => top_level_diff(rust, ts),
    }
}

/// Text fields (serialized XML or form JSON) are reported by their first differing line.
fn top_level_diff(rust: &Json, ts: &Json) -> Result<(), String> {
    let (Some(r), Some(t)) = (rust.as_object(), ts.as_object()) else {
        return json_diff("$", rust, ts).map_or(Ok(()), Err);
    };
    let mut keys: Vec<&String> = r.keys().chain(t.keys()).collect();
    keys.sort();
    keys.dedup();
    for k in keys {
        match (r.get(k), t.get(k)) {
            (Some(Json::String(a)), Some(Json::String(b))) if a != b && a.contains('\n') => {
                return Err(format!("{k} {}", first_diff_line(a, b)));
            }
            (Some(a), Some(b)) => {
                if let Some(d) = json_diff(&format!("$.{k}"), a, b) {
                    return Err(d);
                }
            }
            (Some(_), None) => return Err(format!("$.{k}: only in rust")),
            (None, _) => return Err(format!("$.{k}: only in ts")),
        }
    }
    Ok(())
}
