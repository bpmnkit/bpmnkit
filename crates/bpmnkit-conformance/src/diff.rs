//! Replays `diff/<case>/`: `diff_bpmn(parse(before.bpmn), parse(after.bpmn))` must equal
//! `expected/diff.json`, hashes included, and `diff_to_html` of it `expected/diff.html` byte for
//! byte, `diff_to_svg` `expected/diff.svg` (both recorded by TS).

use crate::json_diff;
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_diff::{diff_bpmn, diff_to_html, diff_to_svg, DiffHtmlOptions};
use bpmnkit_render::RenderOptions;
use serde_json::Value as Json;
use std::path::Path;

/// Runs one case (`diff/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case = dir.join(id);
    let read = |p: &str| {
        std::fs::read_to_string(case.join(p))
            .map_err(|e| format!("{}: {e}", case.join(p).display()))
    };
    let parse = |p: &str| parse_bpmn(&read(p)?).map_err(|e| format!("{p}: {e}"));
    let (before, after) = (parse("before.bpmn")?, parse("after.bpmn")?);
    let expected: Json = serde_json::from_str(&read("expected/diff.json")?)
        .map_err(|e| format!("expected/diff.json: {e}"))?;
    let diff = diff_bpmn(&before, &after);
    let actual = serde_json::to_value(&diff).map_err(|e| e.to_string())?;
    if let Some(d) = json_diff("$", &actual, &expected) {
        return Err(format!("diff.json {d}"));
    }
    let html = diff_to_html(
        &before,
        &after,
        &diff,
        &DiffHtmlOptions::default().title(id.trim_start_matches("diff/")),
    )
    .map_err(|e| format!("diff_to_html: {e}"))?;
    let svg = diff_to_svg(&after, &diff, &RenderOptions::default())
        .map_err(|e| format!("diff_to_svg: {e}"))?;
    for (file, got) in [("diff.html", html), ("diff.svg", svg.markup)] {
        let want = read(&format!("expected/{file}"))?;
        if let Some(why) = first_difference(&got, &want) {
            return Err(format!("{file} {why}"));
        }
    }
    Ok(())
}

/// Where two texts first differ, with some context; `None` when equal.
fn first_difference(got: &str, want: &str) -> Option<String> {
    if got == want {
        return None;
    }
    let at = got
        .bytes()
        .zip(want.bytes())
        .position(|(a, b)| a != b)
        .unwrap_or(got.len().min(want.len()));
    let from = at.saturating_sub(60);
    let snip = |s: &str| {
        s.get(from..(at + 60).min(s.len()))
            .unwrap_or("")
            .to_string()
    };
    Some(format!(
        "differs at byte {at}:\n  got  {:?}\n  want {:?}",
        snip(got),
        snip(want)
    ))
}

/// Ids of diff cases (`diff/<case>`).
pub fn case_ids(dir: &Path) -> Vec<String> {
    crate::load_case_ids(dir, "diff")
}
