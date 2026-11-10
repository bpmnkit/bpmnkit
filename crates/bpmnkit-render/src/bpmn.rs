//! Port of `packages/core/src/bpmn/svg.ts`, line by line so the bytes match.

use crate::icons::{activity_markers, event_marker, gateway_marker, task_icon};
use crate::label_style::{
    collect_label_styles, label_font_css, resolve_label_font, LabelFontCss, LabelStyles,
};
use crate::options::{ColorMode, PlaneSelect, RenderOptions, ThemeColors};
use crate::text::{esc, wrap_text, AVG_CHAR_PX};
use crate::{ElementKind, Geometry, RenderError, RenderWarning, RenderedElement, Svg, ViewBox};
use bpmnkit_bpmn::js::js_number_to_string;
use bpmnkit_bpmn::{Attrs, BpmnGroup};
use bpmnkit_bpmn::{
    BpmnBounds, BpmnDefinitions, BpmnDiLabel, BpmnDiPlane, BpmnFlowElement, BpmnLane, BpmnLaneSet,
    BpmnParticipant, BpmnProcessContents, BpmnSequenceFlow, BpmnTextAnnotation, BpmnWaypoint,
};
use indexmap::IndexMap;
use std::borrow::Cow;
use std::collections::{HashMap, HashSet};

/// JS `String(n)`.
pub(crate) fn n(v: f64) -> String {
    js_number_to_string(v)
}

/// JS `Math.min` of two: NaN wins.
pub(crate) fn js_min(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a < b || (a == b && a.is_sign_negative()) {
        a
    } else {
        b
    }
}

/// JS `Math.max` of two: NaN wins.
pub(crate) fn js_max(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a > b || (a == b && a.is_sign_positive()) {
        a
    } else {
        b
    }
}

fn empty(t: &ThemeColors, background: bool) -> Svg {
    let rect = if background {
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

fn find_plane<'a>(
    defs: &'a BpmnDefinitions,
    select: &PlaneSelect,
) -> Result<Option<&'a BpmnDiPlane>, RenderError> {
    match select {
        PlaneSelect::First => Ok(defs.diagrams.first().map(|d| &d.plane)),
        PlaneSelect::ById(id) => defs
            .diagrams
            .iter()
            .find(|d| &d.id == id || &d.plane.id == id)
            .map(|d| Some(&d.plane))
            .ok_or_else(|| RenderError::PlaneNotFound(id.clone())),
        PlaneSelect::Process(id) => defs
            .diagrams
            .iter()
            .find(|d| &d.plane.bpmn_element == id)
            .map(|d| Some(&d.plane))
            .ok_or_else(|| RenderError::PlaneNotFound(id.clone())),
    }
}

pub(crate) fn render(defs: &BpmnDefinitions, opts: &RenderOptions) -> Result<Svg, RenderError> {
    let t = opts.theme.colors();
    let plane = find_plane(defs, &opts.plane)?;
    // Like TS: only the default plane is laid out, and only when it has no shapes.
    #[cfg(feature = "auto-layout")]
    if opts.auto_layout
        && opts.plane == PlaneSelect::First
        && plane.is_none_or(|p| p.shapes.is_empty())
    {
        let laid =
            bpmnkit_layout::apply_auto_layout(defs, bpmnkit_layout::LayoutEngine::Semantic, None);
        let mut out = render_plane(&laid, find_plane(&laid, &opts.plane)?, opts, t);
        out.warnings.insert(0, RenderWarning::AutoLayoutApplied);
        return Ok(out);
    }
    if defs.diagrams.is_empty() {
        return Err(RenderError::NoDiagram);
    }
    Ok(render_plane(defs, plane, opts, t))
}

#[derive(Clone)]
pub(crate) struct Ctx<'a> {
    pub t: ThemeColors,
    pub opts: &'a RenderOptions,
    pub styles: &'a LabelStyles,
}

impl Ctx<'_> {
    fn font_of(&self, label: Option<&BpmnDiLabel>) -> Option<LabelFontCss> {
        let font = resolve_label_font(label, self.styles)?;
        Some(label_font_css(
            Some(font),
            &self.opts.font.family,
            self.opts.font.size,
        ))
    }

    /// Estimated glyph width for a label font, scaled from the default size (TS `charPx`).
    fn char_px(&self, font: Option<&LabelFontCss>) -> f64 {
        let Some(font) = font else {
            return AVG_CHAR_PX * (self.opts.font.size / 11.0);
        };
        AVG_CHAR_PX * (font.size / 11.0) * if font.bold { 1.1 } else { 1.0 }
    }

    pub(crate) fn font_style(&self, font: Option<&LabelFontCss>) -> String {
        let Some(font) = font else {
            return format!(
                "font-family:{};font-size:{}px",
                self.opts.font.family,
                n(self.opts.font.size)
            );
        };
        let mut out = format!("font-family:{};font-size:{}px", font.family, n(font.size));
        if font.bold {
            out.push_str(";font-weight:bold");
        }
        if font.italic {
            out.push_str(";font-style:italic");
        }
        if font.decoration != "none" {
            out.push_str(";text-decoration:");
            out.push_str(&font.decoration);
        }
        out
    }

    /// A label's inline style, escaped for a double-quoted attribute (TS `textStyle`).
    fn text_style(&self, font: Option<&LabelFontCss>) -> String {
        let t = &self.t;
        esc(&format!(
            "fill:{};{};text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:{};stroke-width:4px;stroke-linejoin:round",
            t.text,
            self.font_style(font),
            t.text_halo
        ))
    }

    /// `<text>` line(s) centred at (cx, cy); `top_align` flows extra lines downward (TS `labelSvg`).
    pub(crate) fn label_svg(
        &self,
        text: &str,
        cx: f64,
        cy: f64,
        max_width: f64,
        top_align: bool,
        font: Option<&LabelFontCss>,
    ) -> String {
        let lines = wrap_text(text, max_width, self.char_px(font));
        let line_h = match font {
            Some(f) => (f.size * self.opts.font.line_height) / self.opts.font.size,
            None => self.opts.font.line_height,
        };
        let style = self.text_style(font);
        if lines.len() == 1 {
            return format!(
                r#"<text style="{style}" x="{}" y="{}">{}</text>"#,
                n(cx),
                n(cy),
                esc(&lines[0])
            );
        }
        let total_h = lines.len() as f64 * line_h;
        let start_y = if top_align {
            cy + line_h / 2.0
        } else {
            cy - total_h / 2.0 + line_h / 2.0
        };
        let mut out = String::new();
        for (i, l) in lines.iter().enumerate() {
            out.push_str(&format!(
                r#"<text style="{style}" x="{}" y="{}">{}</text>"#,
                n(cx),
                n(start_y + i as f64 * line_h),
                esc(l)
            ));
        }
        out
    }

    pub(crate) fn shape_style(&self, sw: f64, dash: Option<&str>) -> String {
        let t = &self.t;
        let mut s = format!(
            "fill:{};stroke:{};stroke-width:{}",
            t.shape_fill,
            t.shape_stroke,
            n(sw)
        );
        if let Some(d) = dash {
            s.push_str(";stroke-dasharray:");
            s.push_str(d);
        }
        s
    }

    pub(crate) fn icon_style(&self) -> String {
        format!(
            "fill:none;stroke:{};stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round",
            self.t.shape_stroke
        )
    }

    /// Wraps icon markup in a `<g>` with a local `<style>` for its classes (TS `iconGroup`).
    fn icon_group(&self, content: &str, x: f64, y: f64) -> String {
        let t = &self.t;
        format!(
            "<g transform=\"translate({} {})\"><style>.bi{{{}}}.bis{{fill:{};stroke:none}}.gm{{fill:{};stroke:none}}.gms{{fill:none;stroke:{};stroke-width:2.5;stroke-linecap:round}}</style>{}</g>",
            n(x),
            n(y),
            self.icon_style(),
            t.shape_stroke,
            t.shape_stroke,
            t.shape_stroke,
            content.replace("var(--_sf)", &t.shape_fill)
        )
    }

    fn render_event(&self, el: Option<&BpmnFlowElement>, width: f64, height: f64) -> String {
        let t = &self.t;
        let cx = width / 2.0;
        let cy = height / 2.0;
        let r = js_min(cx, cy) - 1.0;
        let ty = el.map_or("", |e| e.type_name());
        let is_end = ty == "endEvent";
        let is_intermediate = matches!(
            ty,
            "intermediateCatchEvent" | "intermediateThrowEvent" | "boundaryEvent"
        );
        let non_interrupting = matches!(
            el,
            Some(BpmnFlowElement::BoundaryEvent(b)) if b.cancel_activity == Some(false)
        );
        let is_throw = ty == "intermediateThrowEvent" || non_interrupting;
        let outer_sw = if is_end { 3.0 } else { 1.5 };
        let mut out = format!(
            r#"<circle cx="{}" cy="{}" r="{}" style="fill:{};stroke:{};stroke-width:{}"/>"#,
            n(cx),
            n(cy),
            n(r),
            t.shape_fill,
            t.shape_stroke,
            n(outer_sw)
        );
        if is_intermediate {
            out.push_str(&format!(
                r#"<circle cx="{}" cy="{}" r="{}" style="fill:none;stroke:{};stroke-width:1.5{}"/>"#,
                n(cx),
                n(cy),
                n(r - 3.0),
                t.shape_stroke,
                if non_interrupting {
                    ";stroke-dasharray:4 2"
                } else {
                    ""
                }
            ));
        }
        if let Some(def) = el
            .and_then(BpmnFlowElement::event_definitions)
            .and_then(<[_]>::first)
        {
            let marker = event_marker(def.type_name(), is_throw && !is_end);
            if !marker.is_empty() {
                out.push_str(&self.icon_group(&marker, cx, cy));
            }
        }
        out
    }

    fn render_task(
        &self,
        el: Option<&BpmnFlowElement>,
        width: f64,
        height: f64,
        expanded: bool,
        font: Option<&LabelFontCss>,
    ) -> String {
        let ty = el.map_or("", |e| e.type_name());
        let (sw, dash) = match ty {
            "callActivity" => (3.0, None),
            "eventSubProcess" => (1.5, Some("5 3")),
            _ => (1.5, None),
        };
        let mut out = format!(
            r#"<rect x="0" y="0" width="{}" height="{}" rx="10" style="{}"/>"#,
            n(width),
            n(height),
            self.shape_style(sw, dash)
        );
        if ty == "transaction" {
            out.push_str(&format!(
                r#"<rect x="3" y="3" width="{}" height="{}" rx="8" style="{}"/>"#,
                n(width - 6.0),
                n(height - 6.0),
                self.icon_style()
            ));
        }
        let icon = task_icon(ty);
        if !icon.is_empty() {
            out.push_str(&self.icon_group(icon, 4.0, 4.0));
        }
        if let Some(name) = el
            .and_then(|e| e.base().name.as_deref())
            .filter(|s| !s.is_empty())
        {
            // An expanded container's name sits in a top label, clear of its children.
            if expanded {
                out.push_str(&self.label_svg(name, width / 2.0, 14.0, width - 16.0, true, font));
            } else {
                out.push_str(&self.label_svg(
                    name,
                    width / 2.0,
                    height / 2.0,
                    width - 16.0,
                    false,
                    font,
                ));
            }
        }
        if let Some(el) = el {
            let markers = activity_markers(el, expanded);
            if !markers.is_empty() {
                out.push_str(&self.icon_group(&markers, width / 2.0, height - 10.0));
            }
        }
        out
    }

    fn render_gateway(&self, el: Option<&BpmnFlowElement>, width: f64, height: f64) -> String {
        let cx = width / 2.0;
        let cy = height / 2.0;
        let mut out = format!(
            r#"<polygon points="{},0 {},{} {},{} 0,{}" style="{}"/>"#,
            n(cx),
            n(width),
            n(cy),
            n(cx),
            n(height),
            n(cy),
            self.shape_style(1.5, None)
        );
        let marker = el.map_or("", |e| gateway_marker(e.type_name()));
        if !marker.is_empty() {
            out.push_str(&self.icon_group(marker, cx, cy));
        }
        out
    }

    /// Pool or lane: body, header band, rotated name (TS `renderPool` / `renderLane`).
    fn render_container(
        &self,
        name: Option<&str>,
        width: f64,
        height: f64,
        font: Option<&LabelFontCss>,
    ) -> String {
        let t = &self.t;
        let mut out = format!(
            r#"<rect x="0" y="0" width="{w}" height="{h}" style="fill:{};stroke:{};stroke-width:1.5"/><rect x="0" y="0" width="30" height="{h}" style="fill:{};stroke:{};stroke-width:1.5"/>"#,
            t.shape_fill,
            t.shape_stroke,
            t.pool_header,
            t.shape_stroke,
            w = n(width),
            h = n(height),
        );
        if let Some(name) = name.filter(|s| !s.is_empty()) {
            out.push_str(&format!(
                r#"<text style="{}" transform="translate(15 {}) rotate(-90)">{}</text>"#,
                self.text_style(font),
                n(height / 2.0),
                esc(name)
            ));
        }
        out
    }

    fn render_annotation(
        &self,
        text: Option<&str>,
        width: f64,
        height: f64,
        font: Option<&LabelFontCss>,
    ) -> String {
        let mut out = format!(
            r#"<path d="M{w} 0 L0 0 L0 {h} L{w} {h}" style="fill:none;stroke:{};stroke-width:1.5"/>"#,
            self.t.shape_stroke,
            w = n(width),
            h = n(height),
        );
        if let Some(text) = text.filter(|s| !s.is_empty()) {
            out.push_str(&self.label_svg(
                text,
                width / 2.0,
                height / 2.0,
                width - 8.0,
                false,
                font,
            ));
        }
        out
    }

    fn render_data_object(&self, el: Option<&BpmnFlowElement>, width: f64, height: f64) -> String {
        let fold = js_min(14.0, width / 3.0);
        let mut out = format!(
            r#"<path d="M0 0 H{} L{} {} V{} H0 Z" style="{}"/><path d="M{} 0 V{} H{}" style="{}"/>"#,
            n(width - fold),
            n(width),
            n(fold),
            n(height),
            self.shape_style(1.5, None),
            n(width - fold),
            n(fold),
            n(width),
            self.icon_style()
        );
        if let Some(BpmnFlowElement::DataObjectReference(d)) = el {
            if d.is_collection == Some(true) {
                out.push_str(&self.icon_group(
                    r#"<path d="M-3 -5v9M0 -5v9M3 -5v9" class="bi"/>"#,
                    width / 2.0,
                    height - 6.0,
                ));
            }
        }
        out
    }

    fn render_data_store(&self, width: f64, height: f64) -> String {
        let ry = js_min(8.0, height / 6.0);
        let rx = width / 2.0;
        let shape = self.shape_style(1.5, None);
        format!(
            r#"<path d="M0 {ry} A {rx} {ry} 0 0 0 {w} {ry} V {hr} A {rx} {ry} 0 0 1 0 {hr} Z" style="{shape}"/><ellipse cx="{rx}" cy="{ry}" rx="{rx}" ry="{ry}" style="{shape}"/><path d="M0 {r2} A {rx} {ry} 0 0 0 {w} {r2} M0 {r3} A {rx} {ry} 0 0 0 {w} {r3}" style="{}"/>"#,
            self.icon_style(),
            ry = n(ry),
            rx = n(rx),
            w = n(width),
            hr = n(height - ry),
            r2 = n(ry * 2.0),
            r3 = n(ry * 3.4),
        )
    }

    fn render_group(
        &self,
        name: Option<&str>,
        width: f64,
        height: f64,
        font: Option<&LabelFontCss>,
    ) -> String {
        let mut out = format!(
            r#"<rect x="0" y="0" width="{}" height="{}" rx="8" style="fill:none;stroke:{};stroke-width:1.5;stroke-dasharray:6 3"/>"#,
            n(width),
            n(height),
            self.t.shape_stroke
        );
        if let Some(name) = name.filter(|s| !s.is_empty()) {
            out.push_str(&self.label_svg(name, width / 2.0, 14.0, width - 16.0, true, font));
        }
        out
    }

    /// Fill/stroke from the DI (TS `readDiColor`); `None` when colours are ignored.
    fn with_di_colors(&self, attrs: &Attrs) -> Option<Self> {
        if self.opts.colors != ColorMode::Di {
            return None;
        }
        let mut c = self.clone();
        if let Some(fill) = di_fill(attrs) {
            c.t.shape_fill = fill.clone();
        }
        if let Some(stroke) = di_stroke(attrs) {
            c.t.shape_stroke = stroke.clone();
        }
        Some(c)
    }
}

/// A rounded polyline: each inner corner becomes a quadratic curve (TS `waypointsToPath`).
fn waypoints_to_path(wps: &[BpmnWaypoint]) -> String {
    if wps.len() < 2 {
        return String::new();
    }
    let r = 4.0;
    let mut parts: Vec<String> = vec![];
    for (i, wp) in wps.iter().enumerate() {
        if i == 0 {
            parts.push(format!("M{},{}", n(wp.x), n(wp.y)));
            continue;
        }
        if i == wps.len() - 1 {
            parts.push(format!("L{},{}", n(wp.x), n(wp.y)));
            continue;
        }
        let prev = &wps[i - 1];
        let next = &wps[i + 1];
        let dx1 = wp.x - prev.x;
        let dy1 = wp.y - prev.y;
        let d1 = (dx1 * dx1 + dy1 * dy1).sqrt();
        let dx2 = next.x - wp.x;
        let dy2 = next.y - wp.y;
        let d2 = (dx2 * dx2 + dy2 * dy2).sqrt();
        if d1 < 0.01 || d2 < 0.01 {
            parts.push(format!("L{},{}", n(wp.x), n(wp.y)));
            continue;
        }
        let radius = js_min(js_min(r, d1 / 2.0), d2 / 2.0);
        let ax = wp.x - (dx1 / d1) * radius;
        let ay = wp.y - (dy1 / d1) * radius;
        let bx = wp.x + (dx2 / d2) * radius;
        let by = wp.y + (dy2 / d2) * radius;
        parts.push(format!("L{},{}", n(ax), n(ay)));
        parts.push(format!("Q{},{} {},{}", n(wp.x), n(wp.y), n(bx), n(by)));
    }
    parts.join(" ")
}

fn di_fill(attrs: &Attrs) -> Option<&String> {
    attrs
        .get("bioc:fill")
        .or_else(|| attrs.get("color:background-color"))
}

fn di_stroke(attrs: &Attrs) -> Option<&String> {
    attrs
        .get("bioc:stroke")
        .or_else(|| attrs.get("color:border-color"))
}

fn is_event(ty: &str) -> bool {
    matches!(
        ty,
        "startEvent"
            | "endEvent"
            | "intermediateCatchEvent"
            | "intermediateThrowEvent"
            | "boundaryEvent"
    )
}

fn is_gateway(ty: &str) -> bool {
    matches!(
        ty,
        "exclusiveGateway"
            | "parallelGateway"
            | "inclusiveGateway"
            | "eventBasedGateway"
            | "complexGateway"
    )
}

/// Model lookups by id (TS `buildIndex`). `elements` keeps insertion order: the
/// `ElementWithoutDi` warnings follow it.
#[derive(Default)]
struct ModelIndex<'a> {
    elements: IndexMap<&'a str, &'a BpmnFlowElement>,
    flows: HashMap<&'a str, &'a BpmnSequenceFlow>,
    annotations: HashMap<&'a str, &'a BpmnTextAnnotation>,
    participants: HashMap<&'a str, &'a BpmnParticipant>,
    lanes: HashMap<&'a str, &'a BpmnLane>,
    groups: HashMap<&'a str, &'a BpmnGroup>,
    category_values: HashMap<&'a str, Option<&'a str>>,
    message_flow_ids: HashSet<&'a str>,
    default_flow_ids: HashSet<&'a str>,
}

impl<'a> ModelIndex<'a> {
    fn build(defs: &'a BpmnDefinitions) -> Self {
        let mut idx = Self::default();
        for proc in &defs.processes {
            idx.index_elements(&proc.contents);
            for ta in &proc.contents.text_annotations {
                idx.annotations.insert(&ta.id, ta);
            }
            for g in &proc.contents.groups {
                idx.groups.insert(&g.id, g);
            }
            if let Some(ls) = &proc.lane_set {
                idx.index_lane_set(ls);
            }
        }
        for collab in &defs.collaborations {
            for p in &collab.participants {
                idx.participants.insert(&p.id, p);
            }
            for ta in &collab.text_annotations {
                idx.annotations.insert(&ta.id, ta);
            }
            for g in &collab.groups {
                idx.groups.insert(&g.id, g);
            }
            for mf in &collab.message_flows {
                idx.message_flow_ids.insert(&mf.id);
            }
        }
        for cat in &defs.categories {
            for v in &cat.category_values {
                idx.category_values.insert(&v.id, v.value.as_deref());
            }
        }
        idx
    }

    /// Sub-process contents recurse; only their flow elements and sequence flows, like TS.
    fn index_elements(&mut self, contents: &'a BpmnProcessContents) {
        for el in &contents.flow_elements {
            self.elements.insert(&el.base().id, el);
            if let Some(inner) = el.contents() {
                self.index_elements(inner);
            }
            if matches!(
                el,
                BpmnFlowElement::ExclusiveGateway(_)
                    | BpmnFlowElement::InclusiveGateway(_)
                    | BpmnFlowElement::ComplexGateway(_)
            ) {
                if let Some(d) = el.default_flow().filter(|d| !d.is_empty()) {
                    self.default_flow_ids.insert(d);
                }
            }
        }
        for sf in &contents.sequence_flows {
            self.flows.insert(&sf.id, sf);
        }
    }

    fn index_lane_set(&mut self, ls: &'a BpmnLaneSet) {
        for lane in &ls.lanes {
            self.lanes.insert(&lane.id, lane);
            if let Some(child) = &lane.child_lane_set {
                self.index_lane_set(child);
            }
        }
    }

    fn group_label(&self, g: &BpmnGroup) -> Option<&'a str> {
        let r = g.category_value_ref.as_deref().filter(|r| !r.is_empty())?;
        self.category_values.get(r).copied().flatten()
    }
}

pub(crate) fn id_attr(on: bool, id: &str) -> Cow<'static, str> {
    if on {
        Cow::Owned(format!(r#" data-element-id="{}""#, esc(id)))
    } else {
        Cow::Borrowed("")
    }
}

fn render_plane(
    defs: &BpmnDefinitions,
    plane: Option<&BpmnDiPlane>,
    opts: &RenderOptions,
    t: ThemeColors,
) -> Svg {
    let Some(plane) = plane else {
        return empty(&t, opts.background);
    };
    let padding = opts.padding;
    let idx = ModelIndex::build(defs);
    let styles = collect_label_styles(defs);
    let ctx = Ctx {
        t,
        opts,
        styles: &styles,
    };
    let t = &ctx.t;
    let ids = opts.element_ids;

    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut max_y = f64::NEG_INFINITY;
    for shape in &plane.shapes {
        let BpmnBounds {
            x,
            y,
            width,
            height,
        } = shape.bounds;
        min_x = js_min(min_x, x);
        min_y = js_min(min_y, y);
        max_x = js_max(max_x, x + width);
        max_y = js_max(max_y, y + height);
    }
    for edge in &plane.edges {
        for wp in &edge.waypoints {
            min_x = js_min(min_x, wp.x);
            min_y = js_min(min_y, wp.y);
            max_x = js_max(max_x, wp.x);
            max_y = js_max(max_y, wp.y);
        }
    }
    if !min_x.is_finite() {
        return empty(t, opts.background);
    }

    let ox = min_x - padding;
    let oy = min_y - padding;
    let vw = max_x - min_x + padding * 2.0;
    let vh = max_y - min_y + padding * 2.0;
    let (width, height) = output_size(vw, vh, opts.scale, opts.max_size);

    let mut elements = vec![];
    let mut warnings = vec![];

    // ── Edges ──
    let mut edge_parts: Vec<String> = vec![];
    for edge in &plane.edges {
        if edge.waypoints.len() < 2 {
            continue;
        }
        let el_id = edge.bpmn_element.as_str();
        let flow = idx.flows.get(el_id).copied();
        let is_msg = idx.message_flow_ids.contains(el_id);
        let is_assoc = flow.is_none() && !is_msg;
        let d = waypoints_to_path(&edge.waypoints);
        let stroke = match opts.colors {
            ColorMode::Di => di_stroke(&edge.unknown_attributes).unwrap_or(&t.flow_stroke),
            ColorMode::Ignore => &t.flow_stroke,
        };
        let sw = "1.5";
        let id = id_attr(ids, el_id);
        elements.push(RenderedElement {
            id: el_id.to_owned(),
            kind: if is_msg {
                ElementKind::MessageFlow
            } else if is_assoc {
                ElementKind::Association
            } else {
                ElementKind::SequenceFlow
            },
            geometry: Geometry::Edge(edge.waypoints.iter().map(|w| (w.x, w.y)).collect()),
        });

        if is_assoc {
            edge_parts.push(format!(
                r#"<path d="{d}"{id} fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-dasharray="5 3"/>"#
            ));
            continue;
        }
        let dash = if is_msg {
            r#" stroke-dasharray="6 3""#
        } else {
            ""
        };
        edge_parts.push(format!(
            r#"<path d="{d}"{id} fill="none" stroke="{stroke}" stroke-width="{sw}"{dash} marker-end="url(#arr)"/>"#
        ));

        // Default-flow slash
        if flow.is_some() && idx.default_flow_ids.contains(el_id) {
            let wp0 = &edge.waypoints[0];
            let wp1 = &edge.waypoints[1];
            let dx = wp1.x - wp0.x;
            let dy = wp1.y - wp0.y;
            let len = (dx * dx + dy * dy).sqrt();
            if len > 0.0 {
                let nx = dx / len;
                let ny = dy / len;
                let t_dist = js_min(10.0, len * 0.25);
                let cx = wp0.x + nx * t_dist;
                let cy = wp0.y + ny * t_dist;
                let s = 5.0;
                edge_parts.push(format!(
                    r#"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{stroke}" stroke-width="{sw}"/>"#,
                    n(cx - ny * s),
                    n(cy + nx * s),
                    n(cx + ny * s),
                    n(cy - nx * s)
                ));
            }
        }

        if let (Some(name), Some(b)) = (
            flow.and_then(|f| f.name.as_deref())
                .filter(|s| !s.is_empty()),
            edge.label.as_ref().and_then(|l| l.bounds.as_ref()),
        ) {
            edge_parts.push(ctx.label_svg(
                name,
                b.x + b.width / 2.0,
                b.y + b.height / 2.0,
                b.width,
                false,
                ctx.font_of(edge.label.as_ref()).as_ref(),
            ));
        }
    }

    // ── Shapes ── pool/lane/group/expanded bodies are opaque, so they render first.
    let mut container_parts: Vec<String> = vec![];
    let mut shape_parts: Vec<String> = vec![];
    let mut label_parts: Vec<String> = vec![];
    let mut drawn: HashSet<&str> = HashSet::new();
    for shape in &plane.shapes {
        let BpmnBounds {
            x,
            y,
            width,
            height,
        } = shape.bounds;
        let el_id = shape.bpmn_element.as_str();
        let el = idx.elements.get(el_id).copied();
        let ty = el.map_or("", |e| e.type_name());
        let font = ctx.font_of(shape.label.as_ref());
        let font = font.as_ref();
        let colored = ctx.with_di_colors(&shape.unknown_attributes);
        let sc = colored.as_ref().unwrap_or(&ctx);

        let mut is_container = false;
        let mut kind = el.map(|e| ElementKind::Flow(e.type_name()));
        let inner = if is_event(ty) {
            sc.render_event(el, width, height)
        } else if is_gateway(ty) {
            sc.render_gateway(el, width, height)
        } else if ty == "dataObjectReference" {
            sc.render_data_object(el, width, height)
        } else if ty == "dataStoreReference" {
            sc.render_data_store(width, height)
        } else if el.is_none() {
            if let Some(a) = idx.annotations.get(el_id) {
                kind = Some(ElementKind::TextAnnotation);
                sc.render_annotation(a.text.as_deref(), width, height, font)
            } else if let Some(g) = idx.groups.get(el_id) {
                kind = Some(ElementKind::Group);
                is_container = true;
                sc.render_group(idx.group_label(g), width, height, font)
            } else if let Some(p) = idx.participants.get(el_id) {
                kind = Some(ElementKind::Participant);
                is_container = true;
                sc.render_container(p.name.as_deref(), width, height, font)
            } else if let Some(l) = idx.lanes.get(el_id) {
                kind = Some(ElementKind::Lane);
                is_container = true;
                sc.render_container(l.name.as_deref(), width, height, font)
            } else {
                String::new()
            }
        } else {
            // An expanded body is opaque, so it renders under its own children, like a pool.
            let expanded = matches!(
                ty,
                "subProcess" | "adHocSubProcess" | "eventSubProcess" | "transaction"
            ) && shape.is_expanded == Some(true);
            is_container = expanded;
            sc.render_task(el, width, height, expanded, font)
        };

        if !inner.is_empty() {
            let g = format!(
                r#"<g transform="translate({} {})"{}>{inner}</g>"#,
                n(x),
                n(y),
                id_attr(ids, el_id)
            );
            if is_container {
                container_parts.push(g);
            } else {
                shape_parts.push(g);
            }
            if let Some(kind) = kind {
                elements.push(RenderedElement {
                    id: el_id.to_owned(),
                    kind,
                    geometry: Geometry::Shape(shape.bounds.clone()),
                });
                drawn.insert(el_id);
            }
        }

        // External labels for events, gateways and data elements
        let ext_label = is_event(ty)
            || is_gateway(ty)
            || ty == "dataObjectReference"
            || ty == "dataStoreReference";
        if let Some(name) = el
            .and_then(|e| e.base().name.as_deref())
            .filter(|s| !s.is_empty() && ext_label)
        {
            let lb = shape
                .label
                .as_ref()
                .and_then(|l| l.bounds.clone())
                .unwrap_or(BpmnBounds {
                    x: shape.bounds.x + shape.bounds.width / 2.0 - 40.0,
                    y: shape.bounds.y + shape.bounds.height + 6.0,
                    width: 80.0,
                    height: 20.0,
                });
            label_parts.push(ctx.label_svg(
                name,
                lb.x + lb.width / 2.0,
                lb.y + lb.height / 2.0,
                lb.width,
                true,
                font,
            ));
        }
    }

    for id in idx.elements.keys() {
        if !drawn.contains(id) {
            warnings.push(RenderWarning::ElementWithoutDi {
                id: (*id).to_owned(),
            });
        }
    }

    // ── Assemble ──
    let mut out: Vec<String> = Vec::with_capacity(
        8 + container_parts.len() + edge_parts.len() + shape_parts.len() + label_parts.len(),
    );
    out.push(format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="{} {} {} {}" width="{}" height="{}">"#,
        n(ox),
        n(oy),
        n(vw),
        n(vh),
        n(width),
        n(height)
    ));
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
    out.push("<defs>".into());
    out.push(r#"  <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">"#.into());
    out.push(format!(
        r#"    <path d="M0,0 L8,3 L0,6 Z" fill="{}"/>"#,
        t.flow_stroke
    ));
    out.push("  </marker>".into());
    out.push("</defs>".into());
    out.extend(container_parts);
    out.extend(edge_parts);
    out.extend(shape_parts);
    out.extend(label_parts);
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
        warnings,
    }
}

/// `width`/`height` after `scale`, then shrunk to fit `max_size` (never enlarged).
pub(crate) fn output_size(
    vw: f64,
    vh: f64,
    scale: f64,
    max_size: Option<(f64, f64)>,
) -> (f64, f64) {
    let w = vw * scale;
    let h = vh * scale;
    match max_size {
        Some((mw, mh)) => {
            let f = js_min(js_min(1.0, mw / w), mh / h);
            (w * f, h * f)
        }
        None => (w, h),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn max_size_fits_inside_and_never_upscales() {
        assert_eq!(
            output_size(1600.0, 400.0, 1.0, Some((800.0, 600.0))),
            (800.0, 200.0)
        );
        assert_eq!(
            output_size(400.0, 1200.0, 1.0, Some((800.0, 600.0))),
            (200.0, 600.0)
        );
        assert_eq!(
            output_size(100.0, 50.0, 2.0, Some((800.0, 600.0))),
            (200.0, 100.0)
        );
        assert_eq!(output_size(100.0, 50.0, 2.0, None), (200.0, 100.0));
    }

    #[test]
    fn path_rounds_corners() {
        let wp = |x, y| BpmnWaypoint {
            x,
            y,
            unknown_attributes: None,
        };
        assert_eq!(
            waypoints_to_path(&[wp(0.0, 0.0), wp(10.0, 0.0), wp(10.0, 10.0)]),
            "M0,0 L6,0 Q10,0 10,4 L10,10"
        );
    }

    #[test]
    fn js_min_max_follow_js() {
        assert!(js_min(1.0, f64::NAN).is_nan());
        assert!(js_max(f64::NAN, 1.0).is_nan());
        assert!(js_min(0.0, -0.0).is_sign_negative());
        assert!(js_max(-0.0, 0.0).is_sign_positive());
    }
}
