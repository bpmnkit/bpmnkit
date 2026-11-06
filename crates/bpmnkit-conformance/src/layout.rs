//! `layout/` cases (conformance/README.md, "Layout"): `apply_auto_layout` / `layout_dmn` of the
//! input, serialized, against `expected/<run>.bpmn|.dmn` recorded from TypeScript.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use bpmnkit_layout::{
    apply_auto_layout_owned, layout_dmn_owned, AnnotationSide, GridFill, GridHint, LayoutEngine,
    LayoutHints,
};
use indexmap::IndexMap;
use serde_json::{Map, Value as Json};
use std::path::{Path, PathBuf};

/// Largest difference, in pixels, between two numbers that still counts as a match.
///
/// TS rounds every coordinate with `Math.round`, so a sub-pixel float difference between the
/// two implementations (an intermediate sum evaluated in another order, a division by a
/// different but equivalent expression) can flip one rounding by exactly one pixel. Anything
/// larger is a real layout difference, and so is any difference outside a number.
pub const LAYOUT_TOLERANCE: f64 = 1.0;

/// How a run matched its expected file.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Match {
    Exact,
    /// Identical except for numbers that differ by at most [`LAYOUT_TOLERANCE`].
    WithinTolerance,
}

struct Run {
    /// `layout/<case>/<run>`.
    id: String,
    input: PathBuf,
    options: Json,
    /// Without extension: `expected/<run>`.
    expected: PathBuf,
}

fn runs(dir: &Path) -> Vec<Run> {
    let Ok(rd) = std::fs::read_dir(dir.join("layout")) else {
        return vec![];
    };
    let mut cases: Vec<PathBuf> = rd
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.is_dir())
        .collect();
    cases.sort();
    let mut out = vec![];
    for case in cases {
        let name = case.file_name().unwrap_or_default().to_string_lossy();
        let spec: Json = std::fs::read_to_string(case.join("case.json"))
            .ok()
            .and_then(|t| serde_json::from_str(&t).ok())
            .unwrap_or(Json::Object(Map::new()));
        let input = match spec.get("input").and_then(Json::as_str) {
            Some(rel) => dir.join(rel),
            None => ["input.bpmn", "input.dmn"]
                .iter()
                .map(|f| case.join(f))
                .find(|p| p.exists())
                .unwrap_or_else(|| case.join("input.bpmn")),
        };
        let defaults = if input.extension().is_some_and(|x| x == "dmn") {
            serde_json::json!({"default": {}})
        } else {
            serde_json::json!({"semantic": {}, "grid": {"engine": "grid"}})
        };
        let runs = spec.get("runs").unwrap_or(&defaults);
        for (run, options) in runs.as_object().into_iter().flatten() {
            out.push(Run {
                id: format!("layout/{name}/{run}"),
                input: input.clone(),
                options: options.clone(),
                expected: case.join("expected").join(run),
            });
        }
    }
    out.sort_by(|a, b| a.id.cmp(&b.id));
    out
}

/// Ids of every `layout/` run.
pub fn case_ids(dir: &Path) -> Vec<String> {
    runs(dir).into_iter().map(|r| r.id).collect()
}

fn engine(o: &Json) -> Result<LayoutEngine, String> {
    match o.get("engine").and_then(Json::as_str) {
        None | Some("semantic") => Ok(LayoutEngine::Semantic),
        Some("grid") => Ok(LayoutEngine::Grid),
        Some(other) => Err(format!("unknown engine {other:?}")),
    }
}

fn hints(o: &Json) -> Result<Option<LayoutHints>, String> {
    let Some(h) = o.get("hints") else {
        return Ok(None);
    };
    let mut out = LayoutHints::default();
    if let Some(grids) = h.get("grids").and_then(Json::as_object) {
        let mut m = IndexMap::new();
        for (id, g) in grids {
            let fill = match g.get("fill").and_then(Json::as_str) {
                None => None,
                Some("row") => Some(GridFill::Row),
                Some("column") => Some(GridFill::Column),
                Some(other) => return Err(format!("unknown fill {other:?}")),
            };
            m.insert(
                id.clone(),
                GridHint {
                    columns: g.get("columns").and_then(Json::as_i64),
                    fill,
                },
            );
        }
        out.grids = Some(m);
    }
    if let Some(sides) = h.get("annotationSides").and_then(Json::as_object) {
        let mut m = IndexMap::new();
        for (id, s) in sides {
            let side = match s.as_str() {
                Some("above") => AnnotationSide::Above,
                Some("below") => AnnotationSide::Below,
                Some("left") => AnnotationSide::Left,
                Some("right") => AnnotationSide::Right,
                _ => return Err(format!("unknown annotation side {s}")),
            };
            m.insert(id.clone(), side);
        }
        out.annotation_sides = Some(m);
    }
    Ok(Some(out))
}

/// What the recorder writes for one run: the serialized laid-out model, or the error message.
fn produce(input: &Path, options: &Json) -> Result<String, String> {
    let text = std::fs::read_to_string(input).map_err(|e| format!("{}: {e}", input.display()))?;
    reset_id_counter();
    if input.extension().is_some_and(|x| x == "dmn") {
        let defs = parse_dmn(&text).map_err(|e| e.to_string())?;
        return Ok(serialize_dmn(&layout_dmn_owned(defs)));
    }
    let defs = parse_bpmn(&text).map_err(|e| e.to_string())?;
    let laid = apply_auto_layout_owned(defs, engine(options)?, hints(options)?.as_ref());
    Ok(serialize_bpmn(&laid))
}

/// Whether the text before an attribute value ends in the name of a coordinate attribute
/// (`<dc:Bounds x=`, `<di:waypoint y=`, `width=`, `height=`).
fn is_coordinate(before: &str) -> bool {
    [" x=", " y=", " width=", " height="]
        .iter()
        .any(|a| before.ends_with(a))
}

/// Compares two texts that must be equal except for numbers. Only the value of an `x`, `y`,
/// `width` or `height` attribute counts as a number, so ids such as `Flow_1` and names such as
/// `Step 2` stay exact.
fn compare(actual: &str, expected: &str) -> Result<Match, String> {
    if actual == expected {
        return Ok(Match::Exact);
    }
    let a: Vec<&str> = actual.split('"').collect();
    let e: Vec<&str> = expected.split('"').collect();
    let mut offset = 0;
    let mut tolerated = false;
    for (i, (x, y)) in a.iter().zip(&e).enumerate() {
        if x != y {
            let line = actual[..offset].matches('\n').count() + 1;
            let numeric = |s: &str| s.parse::<f64>().ok().filter(|n| n.is_finite());
            match (i % 2 == 1, numeric(x), numeric(y)) {
                (true, Some(p), Some(q))
                    if is_coordinate(a[i - 1]) && (p - q).abs() <= LAYOUT_TOLERANCE =>
                {
                    tolerated = true;
                }
                (_, p, q) => {
                    let how = match (p, q) {
                        (Some(p), Some(q)) => format!("by {}", (p - q).abs()),
                        _ => "in text".to_string(),
                    };
                    return Err(format!(
                        "differs {how} at line {line}: actual {x:?}, expected {y:?}"
                    ));
                }
            }
        }
        offset += x.len() + 1;
    }
    if a.len() != e.len() {
        return Err(format!(
            "different structure: {} vs expected {} attribute values",
            a.len() / 2,
            e.len() / 2
        ));
    }
    debug_assert!(tolerated);
    Ok(Match::WithinTolerance)
}

/// Checks one run; `Err` says what differs.
pub fn check_run(dir: &Path, id: &str) -> Result<Match, String> {
    let run = runs(dir)
        .into_iter()
        .find(|r| r.id == id)
        .ok_or_else(|| format!("no case {id}"))?;
    let read = |ext: &str| std::fs::read_to_string(run.expected.with_extension(ext)).ok();
    let actual = produce(&run.input, &run.options);
    if let Some(msg) = read("error.txt") {
        let msg = msg.strip_suffix('\n').unwrap_or(&msg).to_string();
        return match actual {
            Err(e) if e == msg => Ok(Match::Exact),
            Err(e) => Err(format!("error {e:?} != {msg:?}")),
            Ok(_) => Err(format!("produced output, expected error {msg:?}")),
        };
    }
    let ext = if run.input.extension().is_some_and(|x| x == "dmn") {
        "dmn"
    } else {
        "bpmn"
    };
    let expected = read(ext)
        .ok_or_else(|| format!("no expected/{}.{ext}", id.rsplit('/').next().unwrap_or("")))?;
    compare(&actual?, &expected)
}

/// [`check_run`] with a panic (an unported `todo!()`) counted as a failure.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    std::panic::catch_unwind(|| check_run(dir, id))
        .unwrap_or_else(|_| Err("panicked".into()))
        .map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exact_and_within_tolerance() {
        let t = r#"<dc:Bounds x="10" y="20.5"/>"#;
        assert_eq!(compare(t, t), Ok(Match::Exact));
        assert_eq!(
            compare(t, r#"<dc:Bounds x="11" y="20.5"/>"#),
            Ok(Match::WithinTolerance)
        );
    }

    #[test]
    fn rejects_more_than_a_pixel_and_non_numbers() {
        let t = r#"<dc:Bounds x="10" y="20"/>"#;
        let far = compare(t, r#"<dc:Bounds x="10" y="22"/>"#).unwrap_err();
        assert!(far.contains("by 2") && far.contains("line 1"), "{far}");
        assert!(compare(r#"<a id="Flow_1"/>"#, r#"<a id="Flow_2"/>"#).is_err());
        assert!(compare(r#"<a name="2"/>"#, r#"<a name="3"/>"#).is_err());
        assert!(compare(r#"<a rows="2"/>"#, r#"<a rows="3"/>"#).is_err());
        assert!(compare("<a/>", "<b/>").is_err());
        assert!(compare(r#"<a x="1"/>"#, r#"<a x="1" y="2"/>"#).is_err());
    }
}
