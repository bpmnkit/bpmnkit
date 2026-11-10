//! `render/` cases: `bpmn_to_svg` of the input with the case's options, byte-equal to
//! `expected/out.svg` recorded from TS `exportSvg`.
//!
//! A case is `render/<case>/` with `input.bpmn` (or `case.json` `"input"`, relative to
//! `conformance/`) and `case.json` `{ "options": { …TS SvgExportOptions… } }`.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_dmn::parse_dmn;
use bpmnkit_render::{
    bpmn_to_svg, decision_table_to_svg, drd_to_svg, ColorMode, FontOptions, PlaneSelect,
    RenderError, RenderOptions, Theme, ThemeColors,
};
use serde_json::{Map, Value as Json};
use std::path::{Path, PathBuf};

/// `render/<case>` ids, sorted; empty when the directory does not exist yet.
pub fn case_ids(dir: &Path) -> Vec<String> {
    let Ok(rd) = std::fs::read_dir(dir.join("render")) else {
        return vec![];
    };
    let mut ids: Vec<String> = rd
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.is_dir())
        .filter_map(|p| Some(format!("render/{}", p.file_name()?.to_str()?)))
        .collect();
    ids.sort();
    ids
}

fn input_path(dir: &Path, case: &Path, spec: &Json) -> PathBuf {
    match spec.get("input").and_then(Json::as_str) {
        Some(rel) => dir.join(rel),
        None => ["input.bpmn", "input.dmn"]
            .iter()
            .map(|f| case.join(f))
            .find(|p| p.exists())
            .unwrap_or_else(|| case.join("input.bpmn")),
    }
}

fn num(v: &Json, key: &str) -> Result<f64, String> {
    v.as_f64()
        .ok_or_else(|| format!("option {key}: not a number"))
}

fn string(v: &Json, key: &str) -> Result<String, String> {
    v.as_str()
        .map(str::to_owned)
        .ok_or_else(|| format!("option {key}: not a string"))
}

fn theme_colors(o: &Map<String, Json>) -> Result<ThemeColors, String> {
    let get = |k: &str| {
        o.get(k)
            .map_or_else(|| Err(format!("theme.{k} missing")), |v| string(v, k))
    };
    Ok(ThemeColors {
        bg: get("bg")?,
        shape_fill: get("shapeFill")?,
        shape_stroke: get("shapeStroke")?,
        flow_stroke: get("flowStroke")?,
        text: get("text")?,
        pool_header: get("poolHeader")?,
        text_halo: get("textHalo")?,
    })
}

/// TS `SvgExportOptions` (camelCase JSON) → [`RenderOptions`].
pub fn options_from_json(o: &Json) -> Result<RenderOptions, String> {
    let mut opts = RenderOptions::default();
    let Some(map) = o.as_object() else {
        return Ok(opts);
    };
    for (key, v) in map {
        opts = match key.as_str() {
            "theme" => opts.theme(match v {
                Json::String(s) if s == "light" => Theme::Light,
                Json::String(s) if s == "dark" => Theme::Dark,
                Json::Object(c) => Theme::Custom(theme_colors(c)?),
                _ => return Err(format!("option theme: {v}")),
            }),
            "padding" => opts.padding(num(v, key)?),
            "scale" => opts.scale(num(v, key)?),
            "maxSize" => {
                let (w, h) = match v {
                    Json::Array(a) if a.len() == 2 => (num(&a[0], key)?, num(&a[1], key)?),
                    Json::Object(m) => (
                        num(m.get("width").unwrap_or(&Json::Null), key)?,
                        num(m.get("height").unwrap_or(&Json::Null), key)?,
                    ),
                    _ => return Err(format!("option maxSize: {v}")),
                };
                opts.max_size(w, h)
            }
            "colors" => opts.colors(match v.as_str() {
                Some("ignore") => ColorMode::Ignore,
                Some("di") => ColorMode::Di,
                _ => return Err(format!("option colors: {v}")),
            }),
            "plane" => opts.plane(match (v.get("id"), v.get("process")) {
                (Some(id), None) => PlaneSelect::ById(string(id, "plane.id")?),
                (None, Some(p)) => PlaneSelect::Process(string(p, "plane.process")?),
                _ => return Err(format!("option plane: {v}")),
            }),
            "autoLayout" => opts.auto_layout(v.as_bool().ok_or("option autoLayout")?),
            "elementIds" => opts.element_ids(v.as_bool().ok_or("option elementIds")?),
            "background" => opts.background(v.as_bool().ok_or("option background")?),
            "font" => {
                let mut font = FontOptions::default();
                if let Some(f) = v.get("family") {
                    font.family = string(f, "font.family")?;
                }
                if let Some(s) = v.get("size") {
                    font.size = num(s, "font.size")?;
                }
                if let Some(l) = v.get("lineHeight") {
                    font.line_height = num(l, "font.lineHeight")?;
                }
                opts.font(font)
            }
            _ => return Err(format!("unknown option {key}")),
        };
    }
    Ok(opts)
}

/// Line and column of the first difference, with a little context from both sides.
fn first_difference(got: &str, want: &str) -> String {
    let at = got
        .bytes()
        .zip(want.bytes())
        .position(|(a, b)| a != b)
        .unwrap_or(got.len().min(want.len()));
    let line = want[..at.min(want.len())].matches('\n').count() + 1;
    let floor = |s: &str, mut i: usize| {
        while !s.is_char_boundary(i) {
            i -= 1;
        }
        i
    };
    let ctx = |s: &str| {
        let start = floor(s, at.saturating_sub(40).min(s.len()));
        let end = floor(s, (at + 60).min(s.len()));
        s[start..end].to_owned()
    };
    format!(
        "line {line}, byte {at}:\n  got:  …{}…\n  want: …{}…",
        ctx(got),
        ctx(want)
    )
}

/// A `.dmn` input renders as a DRD, or as a decision table when `case.json` names a
/// `"decision"`; the table title is the `name` option.
fn check_dmn(xml: &str, spec: &Json, want: &str) -> Result<(), String> {
    let mut options = spec.get("options").cloned().unwrap_or(Json::Null);
    let name = options
        .as_object_mut()
        .and_then(|o| o.remove("name"))
        .and_then(|v| v.as_str().map(str::to_owned));
    let opts = options_from_json(&options)?;
    let defs = parse_dmn(xml).map_err(|e| format!("parse: {e}"))?;
    let svg = match spec.get("decision").and_then(Json::as_str) {
        None => drd_to_svg(&defs, &opts),
        Some(id) => {
            let table = defs
                .decisions
                .iter()
                .find(|d| d.id == id)
                .and_then(|d| d.decision_table.as_ref())
                .ok_or_else(|| format!("no decision table for {id}"))?;
            decision_table_to_svg(table, name.as_deref(), &opts)
        }
    };
    let got = svg.markup + "\n";
    if got == want {
        Ok(())
    } else {
        Err(first_difference(&got, want))
    }
}

/// Runs one `render/<case>` against its expected SVG.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let spec: Json = match std::fs::read_to_string(case.join("case.json")) {
        Ok(t) => serde_json::from_str(&t).map_err(|e| format!("case.json: {e}"))?,
        Err(_) => Json::Object(Map::new()),
    };
    let input = input_path(dir, &case, &spec);
    let xml = std::fs::read_to_string(&input).map_err(|e| format!("{}: {e}", input.display()))?;
    let want_path = case.join("expected").join("out.svg");
    let want =
        std::fs::read_to_string(&want_path).map_err(|e| format!("{}: {e}", want_path.display()))?;
    if input.extension().is_some_and(|x| x == "dmn") {
        return check_dmn(&xml, &spec, &want);
    }
    let opts = options_from_json(spec.get("options").unwrap_or(&Json::Null))?;
    let defs = parse_bpmn(&xml).map_err(|e| format!("parse: {e}"))?;
    reset_id_counter();
    let got = match bpmn_to_svg(&defs, &opts) {
        // The recorder ends the file with a newline.
        Ok(svg) => svg.markup + "\n",
        // TS draws the empty 1×1 document where Rust reports that there is nothing to draw.
        Err(RenderError::NoDiagram) if want.contains(r#"viewBox="0 0 1 1""#) => return Ok(()),
        Err(e) => return Err(format!("render: {e}")),
    };
    if got == want {
        Ok(())
    } else {
        Err(first_difference(&got, &want))
    }
}
