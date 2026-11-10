//! Port of `packages/core/src/dmn/svg.ts`: DRD and decision-table SVG.

use crate::bpmn::{id_attr, js_max, js_min, n, output_size, Ctx};
use crate::label_style::LabelStyles;
use crate::text::{esc, wrap_text};
use crate::{ElementKind, Geometry, RenderOptions, RenderedElement, Svg, ThemeColors, ViewBox};
use bpmnkit_bpmn::js::{js_trim, utf16_len};
use bpmnkit_bpmn::BpmnBounds;
use bpmnkit_dmn::{DmnDecisionTable, DmnDefinitions};
use std::collections::HashMap;

/// The `<svg>` document around `body` (TS `svgRoot`).
#[allow(clippy::too_many_arguments)]
fn svg_root(
    ox: f64,
    oy: f64,
    vw: f64,
    vh: f64,
    opts: &RenderOptions,
    t: &ThemeColors,
    body: Vec<String>,
    defs: &[String],
    elements: Vec<RenderedElement>,
) -> Svg {
    let (width, height) = output_size(vw, vh, opts.scale, opts.max_size);
    let mut out = vec![format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="{} {} {} {}" width="{}" height="{}">"#,
        n(ox),
        n(oy),
        n(vw),
        n(vh),
        n(width),
        n(height)
    )];
    if opts.background {
        out.push(format!(
            r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}"/>"#,
            n(ox),
            n(oy),
            n(vw),
            n(vh),
            t.bg
        ));
    }
    if !defs.is_empty() {
        out.push("<defs>".into());
        out.extend(defs.iter().cloned());
        out.push("</defs>".into());
    }
    out.extend(body);
    out.push("</svg>".into());
    Svg {
        markup: out.join("\n"),
        view_box: ViewBox {
            x: ox,
            y: oy,
            w: vw,
            h: vh,
        },
        width,
        height,
        elements,
        warnings: vec![],
    }
}

fn empty(opts: &RenderOptions, t: &ThemeColors) -> Svg {
    let rect = if opts.background {
        format!(r#"<rect width="1" height="1" fill="{}"/>"#, t.bg)
    } else {
        String::new()
    };
    Svg {
        markup: format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="1" height="1">{rect}</svg>"#
        ),
        view_box: ViewBox {
            x: 0.0,
            y: 0.0,
            w: 1.0,
            h: 1.0,
        },
        width: 1.0,
        height: 1.0,
        elements: vec![],
        warnings: vec![],
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum DrdKind {
    Decision,
    InputData,
    KnowledgeSource,
    BusinessKnowledgeModel,
    Annotation,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum EdgeKind {
    Information,
    Knowledge,
    Authority,
    Association,
}

/// SVG of a DMN requirements diagram; laid out first when it has no DI (TS `exportDrdSvg`).
/// Uses `theme`, `padding`, `scale`, `max_size`, `font`, `element_ids` and `background`.
pub(crate) fn drd(input: &DmnDefinitions, opts: &RenderOptions) -> Svg {
    let styles = LabelStyles::new();
    let ctx = Ctx {
        t: opts.theme.colors(),
        opts,
        styles: &styles,
    };
    let t = &ctx.t;
    let padding = opts.padding;
    let ids = opts.element_ids;

    let laid;
    let defs = if input.diagram.as_ref().is_some_and(|d| !d.shapes.is_empty()) {
        input
    } else {
        laid = bpmnkit_layout::layout_dmn(input);
        &laid
    };
    let Some(diagram) = defs.diagram.as_ref().filter(|d| !d.shapes.is_empty()) else {
        return empty(opts, t);
    };

    let mut kinds: HashMap<&str, DrdKind> = HashMap::new();
    let mut names: HashMap<&str, &str> = HashMap::new();
    for d in &defs.decisions {
        kinds.insert(&d.id, DrdKind::Decision);
        if let Some(name) = d.name.as_deref().filter(|s| !s.is_empty()) {
            names.insert(&d.id, name);
        }
    }
    for d in &defs.input_data {
        kinds.insert(&d.id, DrdKind::InputData);
        if let Some(name) = d.name.as_deref().filter(|s| !s.is_empty()) {
            names.insert(&d.id, name);
        }
    }
    for k in &defs.knowledge_sources {
        kinds.insert(&k.id, DrdKind::KnowledgeSource);
        if let Some(name) = k.name.as_deref().filter(|s| !s.is_empty()) {
            names.insert(&k.id, name);
        }
    }
    for b in &defs.business_knowledge_models {
        kinds.insert(&b.id, DrdKind::BusinessKnowledgeModel);
        if let Some(name) = b.name.as_deref().filter(|s| !s.is_empty()) {
            names.insert(&b.id, name);
        }
    }
    for a in &defs.text_annotations {
        kinds.insert(&a.id, DrdKind::Annotation);
        if let Some(text) = a.text.as_deref().filter(|s| !s.is_empty()) {
            names.insert(&a.id, text);
        }
    }

    let mut edge_kinds: HashMap<&str, EdgeKind> = HashMap::new();
    for d in &defs.decisions {
        for r in &d.information_requirements {
            edge_kinds.insert(&r.id, EdgeKind::Information);
        }
        for r in &d.knowledge_requirements {
            edge_kinds.insert(&r.id, EdgeKind::Knowledge);
        }
        for r in &d.authority_requirements {
            edge_kinds.insert(&r.id, EdgeKind::Authority);
        }
    }
    for b in &defs.business_knowledge_models {
        for r in &b.knowledge_requirements {
            edge_kinds.insert(&r.id, EdgeKind::Knowledge);
        }
        for r in &b.authority_requirements {
            edge_kinds.insert(&r.id, EdgeKind::Authority);
        }
    }
    for k in &defs.knowledge_sources {
        for r in &k.authority_requirements {
            edge_kinds.insert(&r.id, EdgeKind::Authority);
        }
    }
    for a in &defs.associations {
        edge_kinds.insert(&a.id, EdgeKind::Association);
    }

    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut max_y = f64::NEG_INFINITY;
    for s in &diagram.shapes {
        let b = &s.bounds;
        min_x = js_min(min_x, b.x);
        min_y = js_min(min_y, b.y);
        max_x = js_max(max_x, b.x + b.width);
        max_y = js_max(max_y, b.y + b.height);
    }
    for e in &diagram.edges {
        for wp in &e.waypoints {
            min_x = js_min(min_x, wp.x);
            min_y = js_min(min_y, wp.y);
            max_x = js_max(max_x, wp.x);
            max_y = js_max(max_y, wp.y);
        }
    }
    let ox = min_x - padding;
    let oy = min_y - padding;
    let vw = max_x - min_x + padding * 2.0;
    let vh = max_y - min_y + padding * 2.0;

    let mut elements = vec![];
    let mut body = vec![];
    for edge in &diagram.edges {
        if edge.waypoints.len() < 2 {
            continue;
        }
        let id = edge.dmn_element_ref.as_str();
        let kind = edge_kinds.get(id).copied().unwrap_or(EdgeKind::Association);
        let d = edge
            .waypoints
            .iter()
            .enumerate()
            .map(|(i, w)| format!("{}{},{}", if i == 0 { "M" } else { "L" }, n(w.x), n(w.y)))
            .collect::<Vec<_>>()
            .join(" ");
        let (dash, marker) = match kind {
            EdgeKind::Information => ("", r#" marker-end="url(#drd-info)""#),
            EdgeKind::Knowledge => (
                r#" stroke-dasharray="6 3""#,
                r#" marker-end="url(#drd-know)""#,
            ),
            EdgeKind::Authority => (
                r#" stroke-dasharray="2 3""#,
                r#" marker-end="url(#drd-auth)""#,
            ),
            EdgeKind::Association => (r#" stroke-dasharray="5 3""#, ""),
        };
        body.push(format!(
            r#"<path d="{d}"{} fill="none" stroke="{}" stroke-width="1.5"{dash}{marker}/>"#,
            id_attr(ids, id),
            t.flow_stroke
        ));
        elements.push(RenderedElement {
            id: id.to_owned(),
            kind: if kind == EdgeKind::Association {
                ElementKind::DrdAssociation
            } else {
                ElementKind::DrdRequirement
            },
            geometry: Geometry::Edge(edge.waypoints.iter().map(|w| (w.x, w.y)).collect()),
        });
    }

    for shape in &diagram.shapes {
        let b = &shape.bounds;
        let (x, y, width, height) = (b.x, b.y, b.width, b.height);
        let id = shape.dmn_element_ref.as_str();
        let Some(&kind) = kinds.get(id) else {
            continue;
        };
        let style = ctx.shape_style(1.5, None);
        let shape_body = match kind {
            DrdKind::Decision => format!(
                r#"<rect x="0" y="0" width="{}" height="{}" style="{style}"/>"#,
                n(width),
                n(height)
            ),
            DrdKind::InputData => format!(
                r#"<rect x="0" y="0" width="{}" height="{}" rx="{}" style="{style}"/>"#,
                n(width),
                n(height),
                n(height / 2.0)
            ),
            DrdKind::KnowledgeSource => {
                let wave = js_min(8.0, height / 6.0);
                format!(
                    r#"<path d="M0 0 H{} V{} Q{} {} {} {} T0 {} Z" style="{style}"/>"#,
                    n(width),
                    n(height - wave),
                    n((width * 3.0) / 4.0),
                    n(height - wave * 2.0),
                    n(width / 2.0),
                    n(height - wave),
                    n(height - wave)
                )
            }
            DrdKind::BusinessKnowledgeModel => {
                let c = js_min(js_min(15.0, width / 6.0), height / 4.0);
                format!(
                    r#"<path d="M{} 0 H{} L{} {} V{} H0 V{} Z" style="{style}"/>"#,
                    n(c),
                    n(width - c),
                    n(width),
                    n(c),
                    n(height),
                    n(c)
                )
            }
            DrdKind::Annotation => {
                let arm = n(js_min(12.0, width / 4.0));
                format!(
                    r#"<path d="M{arm} 0 H0 V{} H{arm}" style="fill:none;stroke:{};stroke-width:1.5"/>"#,
                    n(height),
                    t.shape_stroke
                )
            }
        };
        let label = names.get(id).map_or_else(String::new, |name| {
            ctx.label_svg(name, width / 2.0, height / 2.0, width - 16.0, false, None)
        });
        body.push(format!(
            r#"<g transform="translate({} {})"{}>{shape_body}{label}</g>"#,
            n(x),
            n(y),
            id_attr(ids, id)
        ));
        elements.push(RenderedElement {
            id: id.to_owned(),
            kind: match kind {
                DrdKind::Decision => ElementKind::DrdDecision,
                DrdKind::InputData => ElementKind::DrdInputData,
                DrdKind::KnowledgeSource => ElementKind::DrdKnowledgeSource,
                DrdKind::BusinessKnowledgeModel => ElementKind::DrdBusinessKnowledgeModel,
                DrdKind::Annotation => ElementKind::DrdAnnotation,
            },
            geometry: Geometry::Shape(BpmnBounds {
                x,
                y,
                width,
                height,
            }),
        });
    }

    let sf = &t.flow_stroke;
    let markers = [
        format!(
            r#"  <marker id="drd-info" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill="{sf}"/></marker>"#
        ),
        format!(
            r#"  <marker id="drd-know" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6" fill="none" stroke="{sf}" stroke-width="1"/></marker>"#
        ),
        format!(
            r#"  <marker id="drd-auth" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><circle cx="3" cy="3" r="2.5" fill="{}" stroke="{sf}" stroke-width="1"/></marker>"#,
            t.shape_fill
        ),
    ];
    svg_root(ox, oy, vw, vh, opts, t, body, &markers, elements)
}

const MIN_COL: f64 = 60.0;
const MAX_COL: f64 = 280.0;
const CELL_PAD: f64 = 8.0;
const TITLE_H: f64 = 28.0;
const MIN_ROW_H: f64 = 28.0;

fn hit_label(table: &DmnDecisionTable) -> String {
    let policy = table.hit_policy.as_deref().unwrap_or("UNIQUE");
    let letter = match policy {
        "UNIQUE" => "U",
        "FIRST" => "F",
        "PRIORITY" => "P",
        "ANY" => "A",
        "COLLECT" => "C",
        "RULE ORDER" => "R",
        "OUTPUT ORDER" => "O",
        _ => "U",
    };
    let agg = match (policy, table.aggregation.as_deref()) {
        ("COLLECT", Some("SUM")) => "+",
        ("COLLECT", Some("MIN")) => "<",
        ("COLLECT", Some("MAX")) => ">",
        ("COLLECT", Some("COUNT")) => "#",
        _ => "",
    };
    format!("{letter}{agg}")
}

#[derive(PartialEq, Eq)]
enum Group {
    Index,
    In,
    Out,
    Note,
}

struct Col {
    header: String,
    cells: Vec<String>,
    w: f64,
    group: Group,
}

/// Non-empty: JS `a || b`.
fn or<'a>(a: Option<&'a str>, b: Option<&'a str>) -> Option<&'a str> {
    a.filter(|s| !s.is_empty())
        .or_else(|| b.filter(|s| !s.is_empty()))
}

/// SVG of a decision table with an optional title bar (TS `exportDecisionTableSvg`).
pub(crate) fn decision_table(
    table: &DmnDecisionTable,
    name: Option<&str>,
    opts: &RenderOptions,
) -> Svg {
    let styles = LabelStyles::new();
    let ctx = Ctx {
        t: opts.theme.colors(),
        opts,
        styles: &styles,
    };
    let t = &ctx.t;
    let padding = opts.padding;
    let ids = opts.element_ids;
    let line_h = opts.font.line_height;
    let char_w = 6.5 * (opts.font.size / 11.0);
    let dash = |s: Option<&str>| match s {
        Some(s) if !js_trim(s).is_empty() => s.to_owned(),
        _ => "-".to_owned(),
    };

    let mut cols = vec![Col {
        header: hit_label(table),
        cells: (1..=table.rules.len()).map(|i| i.to_string()).collect(),
        w: 0.0,
        group: Group::Index,
    }];
    for (i, inp) in table.inputs.iter().enumerate() {
        cols.push(Col {
            header: or(inp.label.as_deref(), inp.input_expression.text.as_deref())
                .map_or_else(|| format!("Input {}", i + 1), str::to_owned),
            cells: table
                .rules
                .iter()
                .map(|r| dash(r.input_entries.get(i).map(|e| e.text.as_str())))
                .collect(),
            w: 0.0,
            group: Group::In,
        });
    }
    for (i, out) in table.outputs.iter().enumerate() {
        cols.push(Col {
            header: or(out.label.as_deref(), out.name.as_deref())
                .map_or_else(|| format!("Output {}", i + 1), str::to_owned),
            cells: table
                .rules
                .iter()
                .map(|r| dash(r.output_entries.get(i).map(|e| e.text.as_str())))
                .collect(),
            w: 0.0,
            group: Group::Out,
        });
    }
    if table
        .rules
        .iter()
        .any(|r| r.description.as_deref().is_some_and(|d| !d.is_empty()))
    {
        cols.push(Col {
            header: "Annotations".into(),
            cells: table
                .rules
                .iter()
                .map(|r| r.description.clone().unwrap_or_default())
                .collect(),
            w: 0.0,
            group: Group::Note,
        });
    }

    for col in &mut cols {
        let longest = col
            .cells
            .iter()
            .map(|c| c.split('\n').map(utf16_len).max().unwrap_or(0))
            .fold(utf16_len(&col.header), usize::max);
        col.w = js_min(
            MAX_COL,
            js_max(MIN_COL, (longest as f64 * char_w + CELL_PAD * 2.0).ceil()),
        );
    }

    let row_height = |texts: &mut dyn Iterator<Item = &str>| -> f64 {
        let mut lines = 1;
        for (i, txt) in texts.enumerate() {
            let w = cols.get(i).map_or(MIN_COL, |c| c.w);
            lines = lines.max(wrap_text(txt, w - CELL_PAD * 2.0, char_w).len());
        }
        js_max(MIN_ROW_H, lines as f64 * line_h + 12.0)
    };

    let total_w = cols.iter().fold(0.0, |s, c| s + c.w);
    let header_h = row_height(&mut cols.iter().map(|c| c.header.as_str()));
    let row_hs: Vec<f64> = (0..table.rules.len())
        .map(|ri| {
            row_height(
                &mut cols
                    .iter()
                    .map(|c| c.cells.get(ri).map_or("", String::as_str)),
            )
        })
        .collect();
    let name = name.filter(|s| !s.is_empty());
    let title_h = if name.is_some() { TITLE_H } else { 0.0 };
    let total_h = title_h + header_h + row_hs.iter().fold(0.0, |s, h| s + h);

    let bold_style = esc(&format!(
        "fill:{};{};font-weight:bold;dominant-baseline:central",
        t.text,
        ctx.font_style(None)
    ));
    let plain_style = esc(&format!(
        "fill:{};{};dominant-baseline:central",
        t.text,
        ctx.font_style(None)
    ));
    let text_at = |text: &str, x: f64, top: f64, w: f64, h: f64, bold: bool| -> String {
        let lines = wrap_text(text, w - CELL_PAD * 2.0, char_w);
        let start_y = top + h / 2.0 - (lines.len() as f64 * line_h) / 2.0 + line_h / 2.0;
        let style = if bold { &bold_style } else { &plain_style };
        let mut out = String::new();
        for (i, l) in lines.iter().enumerate() {
            out.push_str(&format!(
                r#"<text style="{style}" x="{}" y="{}">{}</text>"#,
                n(x + CELL_PAD),
                n(start_y + i as f64 * line_h),
                esc(l)
            ));
        }
        out
    };

    let mut parts: Vec<String> = vec![];
    let cell_style = ctx.shape_style(1.0, None);
    let head_style = format!(
        "fill:{};stroke:{};stroke-width:1",
        t.pool_header, t.shape_stroke
    );
    if let Some(name) = name {
        parts.push(format!(
            r#"<rect x="0" y="0" width="{}" height="{}" style="{cell_style}"/>"#,
            n(total_w),
            n(title_h)
        ));
        parts.push(text_at(name, 0.0, 0.0, total_w, title_h, true));
    }
    let mut x = 0.0;
    for col in &cols {
        parts.push(format!(
            r#"<rect x="{}" y="{}" width="{}" height="{}" style="{cell_style}"/>"#,
            n(x),
            n(title_h),
            n(col.w),
            n(header_h)
        ));
        parts.push(format!(
            r#"<rect x="{}" y="{}" width="{}" height="{}" style="{head_style}"/>"#,
            n(x),
            n(title_h),
            n(col.w),
            n(header_h)
        ));
        parts.push(text_at(&col.header, x, title_h, col.w, header_h, true));
        x += col.w;
    }
    let mut elements = vec![];
    let mut y = title_h + header_h;
    for (ri, rule) in table.rules.iter().enumerate() {
        let h = row_hs.get(ri).copied().unwrap_or(MIN_ROW_H);
        let mut cx = 0.0;
        let mut row = String::new();
        for col in &cols {
            let style = if col.group == Group::Index {
                &head_style
            } else {
                &cell_style
            };
            row.push_str(&format!(
                r#"<rect x="{}" y="{}" width="{}" height="{}" style="{style}"/>"#,
                n(cx),
                n(y),
                n(col.w),
                n(h)
            ));
            row.push_str(&text_at(
                col.cells.get(ri).map_or("", String::as_str),
                cx,
                y,
                col.w,
                h,
                false,
            ));
            cx += col.w;
        }
        parts.push(if ids {
            format!("<g{}>{row}</g>", id_attr(true, &rule.id))
        } else {
            row
        });
        elements.push(RenderedElement {
            id: rule.id.clone(),
            kind: ElementKind::DecisionRule,
            geometry: Geometry::Shape(BpmnBounds {
                x: 0.0,
                y,
                width: total_w,
                height: h,
            }),
        });
        y += h;
    }
    // Heavier divider between inputs and outputs
    if let Some(first_out) = cols.iter().position(|c| c.group == Group::Out) {
        if first_out > 0 {
            let dx = cols[..first_out].iter().fold(0.0, |s, c| s + c.w);
            parts.push(format!(
                r#"<path d="M{} {} V{}" style="{};stroke-width:2.5"/>"#,
                n(dx),
                n(title_h),
                n(total_h),
                ctx.icon_style()
            ));
        }
    }

    svg_root(
        -padding,
        -padding,
        total_w + padding * 2.0,
        total_h + padding * 2.0,
        opts,
        t,
        parts,
        &[],
        elements,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hit_policy_letters() {
        let mut t = DmnDecisionTable::default();
        assert_eq!(hit_label(&t), "U");
        t.hit_policy = Some("COLLECT".into());
        t.aggregation = Some("SUM".into());
        assert_eq!(hit_label(&t), "C+");
        t.hit_policy = Some("RULE ORDER".into());
        assert_eq!(hit_label(&t), "R");
    }
}
