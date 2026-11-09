//! The self-contained HTML diff viewer and the diff-over-diagram SVG (feature `html`).
//!
//! Every string built here has a byte-identical twin in `packages/core/src/bpmn/diff-html.ts`,
//! held by `conformance/diff/<case>/expected/diff.html`. Change both or neither.

use crate::js::{f64_to_js, stringify};
use crate::{BpmnDiff, ChangeKind, ElementChange, Geometry};
use bpmnkit_bpmn::BpmnDefinitions;
use bpmnkit_render::{bpmn_to_svg, RenderError, RenderOptions, Svg, Theme, ViewBox};
use bpmnkit_spec::diff_viewer::DIFF_VIEWER_TEMPLATE;

/// Options for [`diff_to_html`]. Build with [`DiffHtmlOptions::default`] and the setters.
#[derive(Debug, Clone, PartialEq)]
#[non_exhaustive]
pub struct DiffHtmlOptions {
    /// Page title and heading. Default: `"BPMN diff"`.
    pub title: String,
    /// Name of the earlier model in the toolbar and pane caption. Default: `"before"`.
    pub before_label: String,
    /// Name of the later model. Default: `"after"`.
    pub after_label: String,
    /// Diagram theme; the page chrome follows `prefers-color-scheme`. Default: light.
    pub theme: Theme,
    /// Padding around each diagram. Default: 20.
    pub padding: f64,
    /// Lay out a model that has no diagram interchange. Default: false.
    pub auto_layout: bool,
}

impl Default for DiffHtmlOptions {
    fn default() -> Self {
        Self {
            title: "BPMN diff".into(),
            before_label: "before".into(),
            after_label: "after".into(),
            theme: Theme::Light,
            padding: 20.0,
            auto_layout: false,
        }
    }
}

impl DiffHtmlOptions {
    pub fn title(mut self, title: impl Into<String>) -> Self {
        self.title = title.into();
        self
    }
    pub fn labels(mut self, before: impl Into<String>, after: impl Into<String>) -> Self {
        self.before_label = before.into();
        self.after_label = after.into();
        self
    }
    pub fn theme(mut self, theme: Theme) -> Self {
        self.theme = theme;
        self
    }
    pub fn padding(mut self, padding: f64) -> Self {
        self.padding = padding;
        self
    }
    pub fn auto_layout(mut self, on: bool) -> Self {
        self.auto_layout = on;
        self
    }
}

const KINDS: [ChangeKind; 4] = [
    ChangeKind::Added,
    ChangeKind::Removed,
    ChangeKind::Changed,
    ChangeKind::Moved,
];

fn kind_name(k: ChangeKind) -> &'static str {
    match k {
        ChangeKind::Added => "added",
        ChangeKind::Removed => "removed",
        ChangeKind::Changed => "changed",
        ChangeKind::Moved => "moved",
    }
}

fn symbol(k: ChangeKind) -> &'static str {
    match k {
        ChangeKind::Added => "+",
        ChangeKind::Removed => "−",
        ChangeKind::Changed => "~",
        ChangeKind::Moved => "↔",
    }
}

/// Semantic colours, inline so a PNG of [`diff_to_svg`] keeps them.
fn color(k: ChangeKind) -> &'static str {
    match k {
        ChangeKind::Added => "#16a34a",
        ChangeKind::Removed => "#dc2626",
        ChangeKind::Changed => "#d97706",
        ChangeKind::Moved => "#2563eb",
    }
}

/// `&`, `<`, `>` and `"` escaped, as TS `esc` in `svg.ts` does.
fn esc(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn n(f: f64) -> String {
    f64_to_js(f)
}

/// One highlight mark: a wide translucent route for an edge, an outset box for a shape.
fn mark(g: &Geometry, color: &str, ghost: bool) -> String {
    let line = if ghost {
        format!(r#"stroke="{color}" stroke-width="2" stroke-dasharray="6 4""#)
    } else {
        format!(r#"stroke="{color}" stroke-width="4""#)
    };
    if let Some(wps) = g.waypoints.as_ref().filter(|w| !w.is_empty()) {
        let points: Vec<String> = wps
            .iter()
            .map(|p| format!("{},{}", n(p.x), n(p.y)))
            .collect();
        let wide = if ghost {
            line
        } else {
            format!(r#"stroke="{color}" stroke-width="10" stroke-opacity="0.35""#)
        };
        return format!(
            r#"<polyline points="{}" fill="none" {wide} stroke-linecap="round" stroke-linejoin="round"/>"#,
            points.join(" ")
        );
    }
    let (Some(x), Some(y), Some(w), Some(h)) = (g.x, g.y, g.width, g.height) else {
        return String::new();
    };
    format!(
        r#"<rect x="{}" y="{}" width="{}" height="{}" rx="6" fill="none" {line}/>"#,
        n(x - 4.0),
        n(y - 4.0),
        n(w + 8.0),
        n(h + 8.0)
    )
}

fn change_name(c: &ElementChange) -> Option<&str> {
    c.name_after.as_deref().or(c.name_before.as_deref())
}

fn change_label(c: &ElementChange) -> String {
    match change_name(c) {
        None | Some("") => c.id.clone(),
        Some(name) => format!("{name} ({})", c.id),
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Side {
    Before,
    After,
}

/// The overlay marks for one side. Removed elements show on the earlier diagram, added ones on
/// the later; changed and moved show on both, a move with a dashed ghost of where it was.
fn highlights(diff: &BpmnDiff, side: Side, links: bool) -> String {
    let mut out = String::new();
    for (i, c) in diff.changes.iter().enumerate() {
        let skip = match side {
            Side::Before => c.kind == ChangeKind::Added,
            Side::After => c.kind == ChangeKind::Removed,
        };
        if skip {
            continue;
        }
        let geometry = match side {
            Side::Before => c.geometry_before.as_ref(),
            Side::After => c.geometry_after.as_ref(),
        };
        let color = color(c.kind);
        let mut marks = geometry.map_or_else(String::new, |g| mark(g, color, false));
        if side == Side::After && c.kind == ChangeKind::Moved {
            if let Some(old) = &c.geometry_before {
                marks = mark(old, color, true) + &marks;
            }
        }
        if marks.is_empty() {
            continue;
        }
        let kind = kind_name(c.kind);
        let g = format!(
            r#"<g class="bk-hl bk-k-{kind}" data-i="{i}"><title>{kind}: {}</title>{marks}</g>"#,
            esc(&change_label(c))
        );
        if links {
            out.push_str(&format!(r##"<a href="#bk-c{i}">{g}</a>"##));
        } else {
            out.push_str(&g);
        }
    }
    out
}

/// Element ids made unique per pane: two inlined SVGs would otherwise share `#arr`.
fn prefix_ids(svg: &str, prefix: &str) -> String {
    svg.replace(" id=\"", &format!(" id=\"{prefix}"))
        .replace("url(#", &format!("url(#{prefix}"))
}

fn pane(r: &Svg, union: &ViewBox, prefix: &str, label: &str, hl: &str) -> String {
    format!(
        r#"<svg class="bk-svg" xmlns="http://www.w3.org/2000/svg" viewBox="{} {} {} {}" role="img" aria-label="{}"><g transform="translate({} {})">{}</g><g class="bk-diff">{hl}</g></svg>"#,
        n(union.x),
        n(union.y),
        n(union.w),
        n(union.h),
        esc(label),
        n(r.view_box.x),
        n(r.view_box.y),
        prefix_ids(&r.markup, prefix)
    )
}

fn summary(diff: &BpmnDiff) -> String {
    let mut chips = String::new();
    for kind in KINDS {
        let count = match kind {
            ChangeKind::Added => diff.summary.added,
            ChangeKind::Removed => diff.summary.removed,
            ChangeKind::Changed => diff.summary.changed,
            ChangeKind::Moved => diff.summary.moved,
        };
        let zero = if count == 0 { " bk-zero" } else { "" };
        let name = kind_name(kind);
        chips.push_str(&format!(
            r#"<span class="bk-chip bk-k-{name}{zero}">{}{count} {name}</span>"#,
            symbol(kind)
        ));
    }
    if diff.before_hash == diff.after_hash {
        chips.push_str(&format!(
            r#"<span class="bk-chip bk-same" title="semantic hash {}">semantically identical</span>"#,
            diff.after_hash
        ));
    }
    format!(r#"<p class="bk-sum">{chips}</p>"#)
}

fn value(v: Option<&serde_json::Value>, tag: &str) -> String {
    let text = v.map_or_else(|| "(none)".to_string(), |v| esc(&stringify(v)));
    format!("<{tag}>{text}</{tag}>")
}

fn change_list(diff: &BpmnDiff) -> String {
    if diff.changes.is_empty() {
        return r#"<p class="bk-empty">No differences.</p>"#.into();
    }
    let mut out = String::new();
    for kind in KINDS {
        let name = kind_name(kind);
        let mut rows = String::new();
        let mut count = 0;
        for (i, c) in diff.changes.iter().enumerate() {
            if c.kind != kind {
                continue;
            }
            count += 1;
            let mut row = format!(
                r#"<li class="bk-row bk-k-{name}" id="bk-c{i}" data-i="{i}" tabindex="0">"#
            );
            if let Some(el_name) = change_name(c).filter(|s| !s.is_empty()) {
                row.push_str(&format!(
                    r#"<span class="bk-name">{}</span> "#,
                    esc(el_name)
                ));
            }
            if let Some(t) = &c.element_type {
                row.push_str(&format!(r#"<span class="bk-type">{}</span> "#, esc(t)));
            }
            row.push_str(&format!(r#"<code class="bk-id">{}</code>"#, esc(&c.id)));
            if !c.fields.is_empty() {
                row.push_str(r#"<ul class="bk-fields">"#);
                for f in &c.fields {
                    row.push_str(&format!(
                        "<li><code>{}</code> {} → {}</li>",
                        esc(&f.path),
                        value(f.before.as_ref(), "del"),
                        value(f.after.as_ref(), "ins")
                    ));
                }
                row.push_str("</ul>");
            }
            rows.push_str(&row);
            rows.push_str("</li>");
        }
        if count == 0 {
            continue;
        }
        out.push_str(&format!(
            r#"<section class="bk-group bk-k-{name}"><h2>{} {name} <span class="bk-n">{count}</span></h2><ol>{rows}</ol></section>"#,
            symbol(kind)
        ));
    }
    out
}

fn render(defs: &BpmnDefinitions, opts: &DiffHtmlOptions) -> Result<Svg, RenderError> {
    if !opts.auto_layout && defs.diagrams.is_empty() {
        return Err(RenderError::NoDiagram);
    }
    let render = RenderOptions::default()
        .theme(opts.theme.clone())
        .padding(opts.padding)
        .auto_layout(opts.auto_layout);
    bpmn_to_svg(defs, &render)
}

/// `{{NAME}}` → its value in one pass, so substituted text is never scanned again. Matches
/// TS `template.replace(/\{\{([A-Z_]+)\}\}/g, …)`, unknown names left as they are.
fn fill(template: &str, vars: &[(&str, String)]) -> String {
    let mut out =
        String::with_capacity(template.len() + vars.iter().map(|v| v.1.len()).sum::<usize>());
    let mut rest = template;
    while let Some(at) = rest.find("{{") {
        out.push_str(&rest[..at]);
        let after = &rest[at + 2..];
        let len = after
            .bytes()
            .take_while(|b| b.is_ascii_uppercase() || *b == b'_')
            .count();
        let value = (len > 0 && after[len..].starts_with("}}"))
            .then(|| vars.iter().find(|(k, _)| *k == &after[..len]))
            .flatten();
        match value {
            Some((_, v)) => {
                out.push_str(v);
                rest = &after[len + 2..];
            }
            None => {
                // Not a placeholder here; a match may still start at the next `{`.
                out.push('{');
                rest = &rest[at + 1..];
            }
        }
    }
    out.push_str(rest);
    out
}

/// A single self-contained HTML page comparing two models: both diagrams with the changes
/// highlighted, side by side or overlaid, and the change list with field-level detail. It loads
/// nothing (a CSP forbids it) and reads without JavaScript; with it, a click on a change zooms
/// both diagrams to it. The same inputs give the same bytes as TS `renderDiffHtml`.
///
/// ```
/// use bpmnkit_diff::{diff_bpmn, diff_to_html, DiffHtmlOptions};
///
/// let xml = |name: &str| format!(r#"<?xml version="1.0" encoding="UTF-8"?>
/// <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
///   <bpmn:process id="p" isExecutable="true"><bpmn:task id="t" name="{name}" /></bpmn:process>
///   <bpmndi:BPMNDiagram id="d"><bpmndi:BPMNPlane id="pl" bpmnElement="p">
///     <bpmndi:BPMNShape id="t_di" bpmnElement="t"><dc:Bounds x="100" y="80" width="100" height="80" /></bpmndi:BPMNShape>
///   </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
/// </bpmn:definitions>"#);
/// let before = bpmnkit_bpmn::parse_bpmn(&xml("Review")).unwrap();
/// let after = bpmnkit_bpmn::parse_bpmn(&xml("Check")).unwrap();
/// let diff = diff_bpmn(&before, &after);
///
/// let html = diff_to_html(&before, &after, &diff, &DiffHtmlOptions::default().title("order.bpmn")).unwrap();
/// assert!(html.starts_with("<!doctype html>"));
/// assert!(html.contains(r#"<span class="bk-chip bk-k-changed">~1 changed</span>"#));
/// ```
pub fn diff_to_html(
    before: &BpmnDefinitions,
    after: &BpmnDefinitions,
    diff: &BpmnDiff,
    opts: &DiffHtmlOptions,
) -> Result<String, RenderError> {
    let b = render(before, opts)?;
    let a = render(after, opts)?;
    let (bv, av) = (b.view_box, a.view_box);
    let x = bv.x.min(av.x);
    let y = bv.y.min(av.y);
    let union = ViewBox {
        x,
        y,
        w: (bv.x + bv.w).max(av.x + av.w) - x,
        h: (bv.y + bv.h).max(av.y + av.h) - y,
    };
    let json = serde_json::to_value(diff).expect("a BpmnDiff is plain data");
    Ok(fill(
        DIFF_VIEWER_TEMPLATE,
        &[
            ("TITLE", esc(&opts.title)),
            ("SUMMARY", summary(diff)),
            ("BEFORE_LABEL", esc(&opts.before_label)),
            ("AFTER_LABEL", esc(&opts.after_label)),
            (
                "BEFORE_SVG",
                pane(
                    &b,
                    &union,
                    "bk-b-",
                    &opts.before_label,
                    &highlights(diff, Side::Before, true),
                ),
            ),
            (
                "AFTER_SVG",
                pane(
                    &a,
                    &union,
                    "bk-a-",
                    &opts.after_label,
                    &highlights(diff, Side::After, true),
                ),
            ),
            ("CHANGES", change_list(diff)),
            // `<` escaped so no value can close the <script> it sits in.
            ("DIFF_JSON", stringify(&json).replace('<', "\\u003c")),
        ],
    ))
}

/// The later model's SVG with the diff drawn over it (added, changed and moved elements, moves
/// with a ghost of the old place): one image for chat surfaces that cannot show HTML. Feed it
/// to `bpmnkit_render::svg_to_png` for a PNG. Same bytes as TS `diffToSvg`.
pub fn diff_to_svg(
    after: &BpmnDefinitions,
    diff: &BpmnDiff,
    opts: &RenderOptions,
) -> Result<Svg, RenderError> {
    let mut svg = bpmn_to_svg(after, opts)?;
    let end = svg.markup.rfind("</svg>").unwrap_or(svg.markup.len());
    let overlay = format!(
        r#"<g class="bk-diff">{}</g></svg>"#,
        highlights(diff, Side::After, false)
    );
    svg.markup.replace_range(end.., &overlay);
    Ok(svg)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fill_is_one_pass_and_keeps_unknown_names() {
        let vars = [("A", "{{B}}".to_string()), ("B", "x".to_string())];
        assert_eq!(
            fill("{{A}} {{B}} {{C}} {{{B}} {{a}}", &vars),
            "{{B}} x {{C}} {x {{a}}"
        );
    }

    #[test]
    fn ids_get_a_pane_prefix_but_element_ids_do_not() {
        let svg = r#"<marker id="arr"/><path data-element-id="t" marker-end="url(#arr)"/>"#;
        assert_eq!(
            prefix_ids(svg, "bk-a-"),
            r#"<marker id="bk-a-arr"/><path data-element-id="t" marker-end="url(#bk-a-arr)"/>"#
        );
    }

    #[test]
    fn marks_outset_shapes_and_widen_edges() {
        let shape = Geometry {
            x: Some(10.5),
            y: Some(0.0),
            width: Some(100.0),
            height: Some(80.0),
            waypoints: None,
        };
        assert_eq!(
            mark(&shape, "#000", false),
            r##"<rect x="6.5" y="-4" width="108" height="88" rx="6" fill="none" stroke="#000" stroke-width="4"/>"##
        );
        let edge = Geometry {
            waypoints: Some(vec![
                crate::Point { x: 1.0, y: 2.0 },
                crate::Point { x: 3.0, y: 4.0 },
            ]),
            ..Geometry::default()
        };
        assert!(mark(&edge, "#000", true).starts_with(r#"<polyline points="1,2 3,4""#));
        assert_eq!(mark(&Geometry::default(), "#000", false), "");
    }

    #[test]
    fn titles_and_labels_are_escaped() {
        assert_eq!(esc(r#"<a & "b">"#), "&lt;a &amp; &quot;b&quot;&gt;");
    }
}
