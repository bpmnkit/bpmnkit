# Plan: embedding the Rust crates (render, diff, CLI/Slack ergonomics)

**Date:** 2026-11-09 · **Status:** analysis + spec, nothing implemented.
**Audience:** a user who embeds the `bpmnkit` facade crate in a Rust CLI and a Slack server
that share one core, and generates BPMN, DMN, FEEL and forms.

Assumptions (ask if wrong):

- The Slack server is async (tokio). Everything here is sync, pure and `Send + Sync`; callers
  wrap CPU work in `spawn_blocking`.
- "Both libraries" means `@bpmnkit/core` (TS) and the `bpmnkit-*` crates (Rust). TS stays the
  oracle for SVG bytes, as for every other twin (`conformance/README.md`).
- PNG pixels are not a parity target (different resvg builds); SVG bytes are.

---

## 0. What exists today (facts the plan builds on)

| Area | TS | Rust |
|---|---|---|
| BPMN → SVG | `exportSvg(defs, {theme, padding})` `packages/core/src/bpmn/svg.ts:84` (785 lines, pure strings, deterministic, 15 tests in `packages/core/tests/svg.test.ts`) | **none** |
| Richer live renderer | `packages/canvas/src/renderer.ts` (colors via `readDiColor`, data objects, loop markers, planes) | none |
| PNG | browser only (`canvas.ts:695 exportPng`); `@resvg/resvg-js` is a root devDep used for OG images | none |
| DMN graphics | `layoutDmn` (DRD DI) + HTML `<table>` in `core/src/doc/html.ts:222`, ASCII `packages/ascii/src/dmn.ts` | `layout_dmn`, DRD DI model (`DmnDiagramShape{dmn_element_ref,bounds}`), no render |
| Semantic diff | `projectSemantics` / `semanticHash` / `diffSemantics` `semantic-hash.ts:164-201`; `diffDiagram` (`added/removed/changed/moved`) `diagram-diff.ts:150`; CLI `casen diff bpmn` (text/json/`--ascii`) | **none** (only derived `PartialEq`) |
| `xml-patch.ts`, `json-patch.ts` | byte-preserving re-serialisation, **not** a diff; irrelevant to the viewer | — |
| Lint | `lint`, `check` CLI | `lint_diagram -> LintReport` (Serialize), `lint_dmn/lint_form -> Vec<CheckFinding>`; no text rendering |
| Text ↔ BPMN | compact JSON, process text | `compactify`/`expand` (auto-layout + deploy gate), `parse_process_text`/`write_process_text` |
| FEEL / DMN eval | yes | `bpmnkit_feel::evaluate`, `evaluate_decision_table`, `evaluate_decision_graph` |
| Layout | yes | `apply_auto_layout(&defs, LayoutEngine, Option<&LayoutHints>) -> BpmnDefinitions` |
| JS-exact numbers | — | `bpmnkit_bpmn::number::js_number_to_string(f64)` (needed for byte parity) |
| Errors | per module | per crate (`bpmn::ParseError(String)`, `dmn::ParseError`, `xml::XmlError`, `text::TextError`, `builder::BuildError`, `compat::zeebe::DeployabilityError`), **no facade error** |
| Facade | — | `crates/bpmnkit`: pure `pub use` per feature; `default = feel,bpmn,dmn,form`; `full` = all 11 |
| wasm | `@bpmnkit/reebe-wasm` (engine only, wasm-pack, 752 kB gzip budget) | no `bpmnkit-*` crate exposes wasm-bindgen |

Gaps of core `svg.ts` vs canvas (relevant for a "great" PNG): ignores `bioc:`/`color:` colors,
only `diagrams[0]`, no data objects/stores, no loop/MI/compensation markers, no call-activity
`+`, DI-less elements are invisible, fixed 6.5 px/char text estimate, no `scale`.

---

## 1. Native image rendering (BPMN/DMN → SVG → PNG), Rust and TS

### 1.1 Architecture

```
            ┌───────────── bpmnkit-render (new crate) ─────────────┐
 XML ─parse─▶ BpmnDefinitions ─(no DI? apply_auto_layout)─▶ scene ─▶ SVG string ─(feature png)─▶ resvg ─▶ PNG
            │ DmnDefinitions ─(no DI? layout_dmn)─▶ DRD scene ───▶ SVG                                     │
            │ DmnDecisionTable ─────────────────────────▶ table SVG                                        │
            └──────────────────────────────────────────────────────────────────────────────────────────────┘
 TS:  exportSvg (oracle, byte-identical SVG)  ─▶  @resvg/resvg-js (Node) / @resvg/resvg-wasm (browser) ─▶ PNG
```

One SVG generator per language, kept byte-identical by conformance fixtures; one rasteriser
family (resvg) on both sides. The SVG is the contract; PNG is a thin, optional last step.

### 1.2 New crate `crates/bpmnkit-render`

```toml
[dependencies]
bpmnkit-bpmn   = { workspace = true }
bpmnkit-layout = { workspace = true, optional = true }
bpmnkit-dmn    = { workspace = true, optional = true, default-features = false }
resvg          = { version = "0.45", optional = true, default-features = false, features = ["text"] }
# resvg re-exports usvg, tiny-skia, fontdb. Check the resolved MSRV is <= 1.85 when adding.

[features]
default         = ["auto-layout"]
auto-layout     = ["dep:bpmnkit-layout"]          # lay out DI-less models before drawing
dmn             = ["dep:bpmnkit-dmn"]              # DRD + decision-table SVG
png             = ["dep:resvg", "embedded-font"]  # rasteriser
embedded-font   = []                               # bundles assets/fonts/*.ttf (deterministic)
system-fonts    = ["png", "resvg/system-fonts", "resvg/memmap-fonts"]  # fontdb::load_system_fonts
```

No `unsafe`, no global state, no I/O except `system-fonts`. Builds for `wasm32-unknown-unknown`
with `png` + `embedded-font` (no `system-fonts`).

#### Public API (exact)

```rust
// lib.rs
pub use options::{RenderOptions, Theme, ThemeColors, ColorMode, PlaneSelect, FontOptions};
pub use error::RenderError;

/// SVG for a BPMN model. Default options give the same bytes as TS `exportSvg(defs)`.
pub fn bpmn_to_svg(defs: &BpmnDefinitions, opts: &RenderOptions) -> Result<Svg, RenderError>;
/// Parse + render in one call (the CLI/Slack one-liner).
pub fn bpmn_xml_to_svg(xml: &str, opts: &RenderOptions) -> Result<Svg, RenderError>;

#[cfg(feature = "dmn")] pub fn drd_to_svg(defs: &DmnDefinitions, opts: &RenderOptions) -> Result<Svg, RenderError>;
#[cfg(feature = "dmn")] pub fn decision_table_to_svg(table: &DmnDecisionTable, name: Option<&str>, opts: &RenderOptions) -> Result<Svg, RenderError>;

#[cfg(feature = "png")] pub fn svg_to_png(svg: &Svg, png: &PngOptions) -> Result<Vec<u8>, RenderError>;
#[cfg(feature = "png")] pub fn bpmn_to_png(defs: &BpmnDefinitions, opts: &RenderOptions, png: &PngOptions) -> Result<Vec<u8>, RenderError>;

pub struct Svg {
    pub markup: String,          // the full <svg> document
    pub view_box: ViewBox,       // diagram coordinates (x, y, w, h) incl. padding
    pub width: f64, pub height: f64, // CSS px after `scale`
    pub elements: Vec<RenderedElement>, // id + kind + DI bounds/waypoints actually drawn (diff overlays, click maps)
    pub warnings: Vec<RenderWarning>,   // e.g. AutoLayoutApplied, ElementWithoutDi{id}, UnknownPlane{id}
}
pub struct ViewBox { pub x: f64, pub y: f64, pub w: f64, pub h: f64 }
pub struct RenderedElement { pub id: String, pub kind: ElementKind, pub geometry: Geometry }
pub enum Geometry { Shape(BpmnBounds), Edge(Vec<(f64, f64)>) }
pub enum ElementKind { Flow(BpmnElementType), SequenceFlow, MessageFlow, Association, Participant, Lane, TextAnnotation, Group, DrdDecision, DrdInput, DrdKnowledge, DrdBkm, DrdRequirement }

#[non_exhaustive]
pub struct RenderOptions {
    pub theme: Theme,               // Light (default) | Dark | Custom(ThemeColors)
    pub padding: f64,               // 20.0
    pub scale: f64,                 // 1.0; multiplies width/height only, viewBox unchanged
    pub max_size: Option<(f64, f64)>, // fit-inside box (Slack thumbnails); applied after scale, never upscales
    pub colors: ColorMode,          // Ignore (default, = TS today) | Di (honour bioc:/color: fill+stroke)
    pub plane: PlaneSelect,         // First (default) | ById(String) | Process(String)
    pub auto_layout: bool,          // true: lay out when the chosen plane has no shapes (cfg auto-layout)
    pub font: FontOptions,          // family (default "system-ui,-apple-system,sans-serif"), size 11.0, line_height 14.0
    pub element_ids: bool,          // false; true adds data-element-id="…" on each <g>/<path>
    pub background: bool,           // true; false = transparent (Slack dark mode)
}
impl Default for RenderOptions { /* values above */ }
pub struct ThemeColors { pub bg: String, pub shape_fill: String, pub shape_stroke: String, pub flow_stroke: String, pub text: String, pub pool_header: String, pub text_halo: String }

#[cfg(feature = "png")]
#[non_exhaustive]
pub struct PngOptions {
    pub dpi_scale: f32,             // 2.0 (retina); pixel size = Svg.width * dpi_scale
    pub max_pixels: u32,            // 16_000_000 guard against huge diagrams (error, not OOM)
    pub fonts: FontSource,          // Embedded (default) | System | Files(Vec<Vec<u8>>) | Both
}

#[derive(Debug, Clone, PartialEq)]  // hand-written Display + std::error::Error, no new dep
#[non_exhaustive]
pub enum RenderError {
    Parse(bpmnkit_bpmn::ParseError),
    NoDiagram,                       // nothing to draw and auto_layout disabled/unavailable
    PlaneNotFound(String),
    TooLarge { width: u32, height: u32, max_pixels: u32 },
    Raster(String),                  // usvg/resvg failure text
}
```

Default `RenderOptions` must reproduce TS `exportSvg(defs)` byte for byte, and
`RenderOptions{theme: Dark, padding: p, ..}` must equal `exportSvg(defs, {theme:"dark", padding:p})`.
Every new option has the TS twin in `SvgExportOptions` (camelCase: `scale`, `maxSize`,
`colors: "ignore"|"di"`, `plane`, `autoLayout`, `font`, `elementIds`, `background`, and
`theme` widened to `"light"|"dark"|ThemeColors`); TS keeps returning `string` from `exportSvg`
and gains `exportSvgDetailed(defs, opts): {svg, viewBox, width, height, elements, warnings}`.

#### Port rules (where byte parity breaks if you are careless)

- Numbers: every interpolated `f64` goes through `js_number_to_string` (JS `String(n)`).
  Arithmetic in the same order as TS (`x + width / 2`, `Math.min`, `Math.sqrt`) to keep the
  same bits; no `mul_add`, no reassociation.
- Text: `wrapText` uses UTF-16 length (`s.encode_utf16().count()`), JS `\s+` split and JS
  `trim()` (`bpmnkit_bpmn::js::js_trim`-style); `esc()` escapes `& < > "` only.
- Label fonts: port `label-style.ts` (`collectLabelStyles`, `resolveLabelFont`, `labelFontCss`)
  into `bpmnkit-render/src/label_style.rs`. DI label styles live in `unknown_children` of the
  diagram (`bpmndi:BPMNLabelStyle`); read them there.
- Order of output: containers → edges → shapes → external labels (svg.ts:255-275); iterate
  `plane.shapes` / `plane.edges` in document order (they are `Vec`, so this is free).
- Icons/markers: copy the SVG path literals from `taskIcon`, `eventMarker`, `gatewayMarker`,
  `subProcessMarker` verbatim into `src/icons.rs` as `&'static str`; the `<style>` class trick
  (`bi/bis/gm/gms`) stays, resvg's CSS engine supports class selectors.
- Element lookup: one `HashMap<&str, &BpmnFlowElement>` walking `BpmnProcessContents`
  recursively (sub-processes via `BpmnFlowElement::contents()`), plus participants, lanes,
  annotations, message-flow ids and default-flow ids, as `buildIndex` (svg.ts:723).

#### Feature additions (both languages, opt-in, one conformance case each)

1. `colors: Di` — fill/stroke from `bioc:fill|stroke` / `color:background-color|border-color`
   (TS `readDiColor`; Rust reads `BpmnDiShape.unknown_attributes`, same precedence as `di-color.ts`).
2. `plane` — render a collapsed sub-process plane (`BPMNDiagram` whose plane points at it).
3. Data objects/stores, groups, loop / parallel MI / sequential MI / compensation markers,
   call-activity `+` — ported from `packages/canvas/src/renderer.ts` into `svg.ts` first
   (so TS remains the oracle), then into Rust. These change default output, so they land as
   one fixture re-record with a dated progress entry (they are fixes: elements invisible today).
4. DI-less input: `auto_layout` (Rust `apply_auto_layout(&defs, LayoutEngine::Semantic, None)`,
   TS `layoutProcess`/`withAutoLayout` path) then render; emits `RenderWarning::AutoLayoutApplied`.
   Layout twins are already byte-exact, so the result stays in parity.
5. `scale` / `max_size`: only `width`/`height` attributes change; viewBox does not. Thumbnail =
   `max_size: Some((800.0, 600.0))` (Slack unfurl renders well ≤ 800 px wide).

#### Text and fonts

- Wrapping stays an estimate (6.5 px × size/11, ×1.1 bold) in both languages: it is the only
  way to keep TS and Rust identical without shipping font metrics to TS. Real glyphs are drawn
  by the rasteriser; labels can be slightly narrower or wider than the estimate, never clipped
  (SVG text is not clipped).
- Optional later (not in this plan): `FontOptions::metrics: Option<&'static FontMetrics>` with
  per-glyph advance tables generated by `spec-gen` for the embedded font, used by both sides.
- **Embedded font (default for PNG):** one Latin+Latin-Ext subset of Inter or Noto Sans
  (OFL), regular + bold, ~2 × 90 kB, stored once in `assets/fonts/` and `include_bytes!`'d.
  `fontdb` is set with `set_sans_serif_family("Inter")` and the SVG `font-family` list ends in
  `sans-serif`, so `system-ui` falls through to it. Result: identical PNG bytes for the same
  crate version on every OS, including containers without fonts (the common Slack-server case).
- **System fonts** (`system-fonts` feature, `FontSource::System|Both`): better CJK/emoji
  coverage, non-deterministic, slower first call (font scan, cache the `fontdb::Database` in a
  `OnceLock`). Document `Both` for international labels.
- CJK/emoji with `Embedded` only render as tofu; `RenderWarning::MissingGlyphs` is not feasible
  cheaply, so document it.

#### Size, speed, wasm

- Without `png`: a few hundred lines, deps only on `bpmnkit-bpmn` (+ layout). Negligible size.
- With `png`: resvg + usvg + tiny-skia + fontdb + rustybuzz + ttf-parser ≈ 1.5–2.5 MB release
  (fat LTO), + ~180 kB font. Measure in the task and record in `doc/progress.md`.
- Raster time target: < 50 ms for a 50-node diagram at `dpi_scale 2` (bench in `benches/`, not in CI gate).
- wasm32: `png + embedded-font` compiles (resvg is pure Rust). No wasm-bindgen in this crate;
  a wrapper is a separate decision (see 1.4).

#### Conformance (parity strategy)

- New fixture family `conformance/render/<case>/`:
  `input.bpmn` (or `input.dmn`), `case.json` = `{ "options": {...TS option names...} }`,
  `expected/out.svg` recorded from TS `exportSvg` / `exportDrdSvg` / `exportDecisionTableSvg`.
- Seed cases: every `conformance/bpmn/*/input.bpmn` with default options (cheap, ~30 cases),
  plus one case per option: `dark`, `padding-40`, `scale-2`, `max-size`, `colors-di`,
  `plane-collapsed`, `auto-layout`, `element-ids`, `no-background`, DRD, decision table.
- Recorder: `packages/core/tests/render-conformance.test.ts` (matches the existing
  `vitest run conformance` filter in `scripts/conformance-record.mjs`; no script change).
- Rust runner: `crates/bpmnkit-conformance/src/render.rs` + `tests/render.rs`, byte-equal
  compare; cases not yet implemented in Rust go in `conformance/pending.json`.
- PNG: one smoke test per feature (decodes, size = expected, non-blank pixel count), plus a
  golden PNG for `embedded-font` checked at a 0.5 % pixel-difference threshold (resvg version
  bumps re-record it).

### 1.3 DMN

- **DRD:** `drd_to_svg` draws decisions (rect), input data (stadium), knowledge sources
  (wavy-bottom), BKMs (clipped-corner rect), information/knowledge/authority requirements
  (solid arrow / dashed arrow / dotted with circle). Missing DI → `layout_dmn` (Rust) /
  `layoutDmn` (TS), sizes already agreed (decision 180×80, input 125×45, …).
- **Decision table:** `decision_table_to_svg` renders hit policy header, input/output columns,
  annotations, rules; column width = max(estimated text width) clamped to [60, 280] px with
  the same wrap estimate. This is the most useful Slack image for DMN (tables read badly as text).
- TS twins in new `packages/core/src/dmn/svg.ts`: `exportDrdSvg(defs, opts)`,
  `exportDecisionTableSvg(table, opts)`; exported from `packages/core/src/index.ts`.

### 1.4 PNG from TypeScript

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| `@resvg/resvg-js` (native N-API) in `apps/cli` | already a root devDep, fast, Node only | runtime dep of the CLI (move to `apps/cli` `dependencies`), native binaries per platform | **Use for CLI** (`casen render --png`) |
| `@resvg/resvg-wasm` | Node + browser + edge, same engine | ~2.5 MB wasm, async init | Use where a non-Node TS user needs PNG; document, do not bundle into core |
| Compile `bpmnkit-render` to wasm (wasm-bindgen package) | one implementation, PNG bytes = Rust | new published npm package, build pipeline, size budget, duplicates the TS SVG path | **Not now.** Revisit if TS SVG and Rust ever diverge on purpose |
| Browser canvas (`canvas.ts exportPng`) | exists | browser only, system fonts | keep |

`@bpmnkit/core` stays zero-dependency: it only produces SVG. The CLI loads the same
`assets/fonts/*.ttf` into resvg-js (`font: { fontBuffers, defaultFontFamily }`) so CLI PNGs
look like Rust PNGs (same font, close but not byte-identical rasteriser versions).

---

## 2. BPMN diff (semantic API + self-contained HTML viewer)

### 2.1 What to reuse

- `projectSemantics`/`diffSemantics` (semantic-hash.ts): canonical per-element JSON excluding
  DI and presentation attrs → added / removed / changed with `before`/`after` values. This is
  the semantic core; port it, do not reinvent.
- `diffDiagram` (diagram-diff.ts): adds `moved` (DI-only change, coords rounded to 2 dp) and
  per-plane summaries. Port it too.
- `xml-patch.ts` / `json-patch.ts`: not reusable (formatting preservation, not diffing).

### 2.2 New crate `crates/bpmnkit-diff`

```toml
[dependencies]
bpmnkit-bpmn = { workspace = true }
serde = { workspace = true }; serde_json = { workspace = true }
bpmnkit-render = { workspace = true, optional = true, default-features = false }
[features]
default = []
html = ["dep:bpmnkit-render"]        # self-contained HTML viewer
```

```rust
/// Port of TS `projectSemantics`; JSON values are serde_json::Value with sorted keys.
pub fn project_semantics(defs: &BpmnDefinitions) -> SemanticProjection;
pub struct SemanticProjection { pub value: serde_json::Value, pub elements: IndexMap<String, serde_json::Value> }
/// Port of TS `semanticHash` (SHA-256 hex of the canonical projection). sha256 moves from
/// crates/bpmnkit-conformance/src/sha256.rs into this crate (no new dependency).
pub fn semantic_hash(defs: &BpmnDefinitions) -> String;
/// Port of TS `diffSemantics` + `diffDiagram`, merged into one result.
pub fn diff_bpmn(before: &BpmnDefinitions, after: &BpmnDefinitions) -> BpmnDiff;

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiff {
    pub changes: Vec<ElementChange>,     // sorted by (kind order, id)
    pub planes: Vec<PlaneSummary>,       // = TS BpmnDiffPlaneSummary
    pub summary: DiffSummary,            // counts per ChangeKind + total
    pub before_hash: String, pub after_hash: String,  // equal ⇒ semantically identical
}
pub struct ElementChange {
    pub id: String,
    pub kind: ChangeKind,                // Added | Removed | Changed | Moved
    pub element_type: Option<String>,    // "serviceTask", "sequenceFlow", "participant", …
    pub name_before: Option<String>, pub name_after: Option<String>,
    pub fields: Vec<FieldChange>,        // only for Changed
    pub geometry_before: Option<Geometry>, pub geometry_after: Option<Geometry>, // from DI
}
pub struct FieldChange { pub path: String, pub before: Option<serde_json::Value>, pub after: Option<serde_json::Value> }
// path: JSON-pointer-like into the element projection, e.g. "name", "conditionExpression",
// "extensionElements/zeebe:taskDefinition/@type", "targetRef" (flow re-wired)

/// Render-ready description (no HTML) for chat surfaces.
pub fn diff_to_text(diff: &BpmnDiff, opts: &DiffTextOptions) -> String;      // plain + markdown modes
#[cfg(feature = "html")]
pub fn diff_to_html(before: &BpmnDefinitions, after: &BpmnDefinitions, diff: &BpmnDiff, opts: &DiffHtmlOptions) -> Result<String, bpmnkit_render::RenderError>;
pub struct DiffHtmlOptions { pub title: Option<String>, pub render: bpmnkit_render::RenderOptions, pub before_label: String /* "before" */, pub after_label: String /* "after" */ }
```

`FieldChange` is computed from the projection pair by a small recursive JSON diff
(`json_changes(before, after, prefix) -> Vec<FieldChange>`); arrays of children are matched by
`id` when items carry one, by index otherwise. TS twin (cheap, ~80 lines):
`diffBpmn(before, after): BpmnDiff` in `packages/core/src/bpmn/bpmn-diff.ts`, composed from
the existing `diffSemantics` + `diffDiagram` + the same `jsonChanges`. Conformance:
`conformance/diff/<case>/{before.bpmn, after.bpmn, expected/diff.json}` (pairs: rename, retype,
rewire flow, condition change, zeebe header change, add/remove lane, move-only, no-op reformat,
ids-only change). Hashes are part of the JSON so `semantic_hash` gets parity for free.

### 2.3 HTML viewer (single file, no network)

Output of `diff_to_html`, and later `casen diff bpmn --html out.html` (TS) — both from the
same template so they match:

- **Template source of truth:** `spec/templates/diff-viewer.html` (+ `.css`, `.js` inlined).
  `scripts/spec-gen.mjs` emits it as a string constant to TS
  (`packages/core/src/generated/diff-viewer.ts`) and Rust
  (`crates/bpmnkit-spec/src/generated/diff_viewer.rs`). Placeholders: `{{TITLE}}`,
  `{{BEFORE_SVG}}`, `{{AFTER_SVG}}`, `{{DIFF_JSON}}`. Both renderers only substitute; the
  viewer's logic is the inlined JS, written once.
- **Layout:** header (title, counts as chips: +added −removed ~changed ↔moved, semantic-equal
  badge when hashes match) · toolbar (radio: Side by side / Overlay / Before / After; checkbox
  per change kind) · main view · change list (grouped by kind; each row: type icon, name, id,
  field changes as `path: before → after`).
- **Highlights:** SVGs are inlined unchanged; an overlay `<g class="bk-diff">` is appended
  inside each `<svg>` in the same viewBox coordinates, built from `geometry_before/after`:
  shapes get an outset rounded rect (4 px stroke), edges a wide translucent polyline. Colors:
  added green, removed red, changed amber, moved blue (semantic colours, exempt from brand
  tokens). Removed elements are highlighted on the *before* diagram; added/changed/moved on the
  *after* diagram; moved also shows a dashed ghost of the old bounds on *after*.
- **Overlay mode:** both SVGs stacked in one box with a shared viewBox (union of both
  viewBoxes, so they align), before at 35 % opacity + a slider. CSS only.
- **Interaction (inline JS ≤ 150 lines, no deps):** click a list row → pan/zoom both views to
  the element (viewBox animation) and pulse its highlight; click a highlight → scroll the list
  row into view; wheel zoom + drag pan synced between the two panes; keyboard `j/k` next/prev
  change. Works with JS disabled (static highlights + list).
- **Self-contained:** no `<link>`, `<script src>`, web fonts or images; CSP meta
  `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'`. Dark mode via
  `prefers-color-scheme` with `RenderOptions.theme` chosen to match.
- Size: two SVGs + ~15 kB template. A 200-node diagram stays well under 1 MB.
- **Slack:** Slack does not render HTML. The server uploads the HTML as a file and posts
  `diff_to_text(.., Markdown)` + a PNG: `bpmn_to_png` of the *after* diagram with the diff
  overlay — expose that as `diff_to_svg(after, diff, opts) -> Svg` (after diagram + overlay,
  no HTML) in the `html` feature so PNG is just `svg_to_png`.

---

## 3. More for a CLI / Slack embedding — exists vs build, ranked

| # | Item | Exists | Build | Value | Effort |
|---|---|---|---|---|---|
| 1 | **PNG/SVG render** (§1) | TS SVG only | `bpmnkit-render` | very high | L |
| 2 | **Facade error + one-call helpers** | per-crate errors | `bpmnkit::Error` enum (`#[non_exhaustive]`, `From` for every crate error, `Display` with element id when known); `bpmnkit::detect(&str) -> DocKind{Bpmn,Dmn,Form,ProcessText,CompactJson,Unknown}`; `bpmnkit::load(&str) -> Result<Document, Error>` | high | S |
| 3 | **Lint/validate report rendering** | `LintReport`, `CheckFinding` (Serialize) | `bpmnkit_lint::report::{to_text(&LintReport, TextStyle{color: bool, max: usize}), to_markdown(&LintReport), to_slack_mrkdwn(&LintReport)}` + same for `&[CheckFinding]`; optional PNG with offending elements outlined (reuse diff overlay, `render::overlay_svg(&Svg, &[Highlight])`) | high | S (text) / S (overlay once §1 done) |
| 4 | **Semantic diff + HTML** (§2) | TS only | `bpmnkit-diff` | high | M |
| 5 | **Facade features + prelude + examples** | feature per crate | features `render`, `render-png`, `render-system-fonts`, `diff`, `diff-html`; `full` adds `render`,`diff` (pure, small) but **not** `render-png` (heavy); `bpmnkit::prelude`; `crates/bpmnkit/examples/{render_png.rs, diff_html.rs, lint_report.rs, text_to_bpmn.rs, eval_dmn.rs}` (compiled by `cargo test --examples`) | high | S |
| 6 | **Text → BPMN → PNG one-liner** | `expand`/`parse_process_text` (+ layout, deploy gate) | `bpmnkit::text::render_png(text)`-style composition lives in examples only; no new API | high | XS |
| 7 | **DMN table / DRD image** (§1.3) | none | in `bpmnkit-render` `dmn` feature | medium-high | M |
| 8 | **Stable ids for generated models** | `stable_ids::assign_stable_flow_ids`, `ids::reset_id_counter` (thread-local) | doc only: in a tokio server never rely on `reset_id_counter` (task may hop threads); use text `expand` (content-derived ids) or `assign_stable_flow_ids` | medium | XS |
| 9 | **FEEL / DMN eval for chat** | `evaluate`, `evaluate_decision_graph` | `Value` → display string helper (`feel::Value::to_feel_string()` if absent) + JSON in/out helpers `Context::from_json(&serde_json::Value)` (check existing) | medium | S |
| 10 | **ASCII render in Rust** (port `packages/ascii`) | TS only | `bpmnkit-ascii` crate + conformance | medium (Slack code blocks, terminals) | **done 2026-11-09** (`conformance/ascii/`, facade feature `ascii`) |
| 11 | **wasm-bindgen of render/diff for TS** | — | see §1.4 | low now | L |

Docs: one guide page `apps/landing/src/content/docs/rust/embedding.md` (render, diff, lint
report, errors, features, Slack recipe: `spawn_blocking`, upload PNG via `files.uploadV2`,
thumbnail size), then `pnpm --filter @bpmnkit/docspack build`.

---

## 4. Work split (parallel sessions, disjoint files)

Dependency graph: **T1 ∥ T2 ∥ T3 ∥ T5** start together; **T4** after T1 (SVG API) and T3
(diff types). T1/T2 meet only through conformance fixtures (T2 records, T1 consumes; T1 marks
missing fixtures pending until T2 lands).

Shared-file rule: only the owner edits a shared file; others append in a follow-up commit
after rebase. Owners: root `Cargo.toml` workspace deps → each task adds its own one line (tiny
rebase conflict at worst); `crates/bpmnkit/{Cargo.toml,src/lib.rs}` → **T5 only** (it adds
`render`/`diff` features pointing at crates that T1/T3 create; T5 may stub-guard with
`#[cfg(feature)]` and land after T1/T3 if needed); `doc/progress.md` → everyone, one dated
entry each (append at top, resolve trivially); `conformance/pending.json` → T1 and T3.

### T1 — `bpmnkit-render` crate: BPMN SVG + PNG (Rust)  · model: **Opus** (byte-parity port, font/raster decisions)

- Files: `crates/bpmnkit-render/**` (new), `assets/fonts/` (new, OFL licence file included),
  `crates/bpmnkit-conformance/src/render.rs`, `crates/bpmnkit-conformance/tests/render.rs`,
  `crates/bpmnkit-conformance/Cargo.toml`, one line in root `Cargo.toml`.
- API: §1.2 (BPMN part; `dmn` feature left as `todo` behind cfg = not exported yet).
- Phase a: port `svg.ts` as of today → byte-equal on fixtures with default/dark/padding options.
  Phase b: `scale`, `max_size`, `background`, `element_ids`, `colors: Di`, `plane`, `auto_layout`
  (follow T2's fixtures). Phase c: `png` + `embedded-font` + `system-fonts`.
- Tests: conformance runner over `conformance/render/**` (pending list honoured), unit tests
  for `wrap_text` (UTF-16, long word), `js_number_to_string` usage, `max_size` math, PNG smoke
  + golden (threshold), `TooLarge` guard, `cargo build --target wasm32-unknown-unknown -p
  bpmnkit-render --no-default-features --features png,embedded-font` in a test script.
- Done when: all non-pending render fixtures byte-equal; `pnpm verify:rust` green; binary size
  delta and raster bench recorded in `doc/progress.md`; README via crate docs (`//!` with examples).

### T2 — TS `exportSvg` v2 options + render conformance recorder (TS)  · model: **Sonnet**

- Files: `packages/core/src/bpmn/svg.ts`, `packages/core/src/dmn/svg.ts` (new),
  `packages/core/src/index.ts` (exports only), `packages/core/tests/svg.test.ts`,
  `packages/core/tests/dmn-svg.test.ts` (new), `packages/core/tests/render-conformance.test.ts`
  (new), `conformance/render/**` (recorded), `conformance/README.md` (render section).
- API: `SvgExportOptions` additions + `exportSvgDetailed` (§1.2), `exportDrdSvg`,
  `exportDecisionTableSvg` (§1.3); port data objects/stores, groups, loop/MI/compensation
  markers, call-activity `+` from `packages/canvas/src/renderer.ts` (keep canvas untouched).
- Tests: one vitest per option; existing 15 svg tests still pass (default output may change
  only through the listed element additions — call it out in the progress entry).
- Done when: `pnpm conformance:record` is clean on a second run; Biome/typecheck/tests green;
  changeset for `@bpmnkit/core` (minor); `doc/features.md` updated.

### T3 — `bpmnkit-diff` crate + TS `diffBpmn` + diff conformance  · model: **Sonnet** (Opus if the projection port gets subtle)

- Files: `crates/bpmnkit-diff/**` (new; moves `sha256.rs` copy from conformance into it),
  `crates/bpmnkit-conformance/src/diff.rs`, `tests/diff.rs`, `packages/core/src/bpmn/bpmn-diff.ts`
  (new), `packages/core/tests/bpmn-diff.test.ts` (+ recording in a new
  `packages/core/tests/diff-conformance.test.ts`), `conformance/diff/**`, one line in root
  `Cargo.toml`, export line in `packages/core/src/index.ts` (coordinate with T2: append-only).
- API: §2.2 without the `html` feature (`project_semantics`, `semantic_hash`, `diff_bpmn`,
  `diff_to_text`).
- Tests: the nine fixture pairs in §2.2 byte-equal JSON; hash parity; `diff_to_text` snapshot.
- Done when: Rust ≡ TS on all pairs; `casen diff bpmn --format json` unchanged (it keeps
  `diffDiagram`; switching it is T4).

### T4 — HTML diff viewer (template + Rust + CLI)  · model: **Opus** (UX + shared template) · depends on T1 (phase a) + T3

- Files: `spec/templates/diff-viewer.{html,css,js}` (new), `scripts/spec-gen/` emitter for it,
  `packages/core/src/generated/diff-viewer.ts`, `crates/bpmnkit-spec/src/generated/diff_viewer.rs`,
  `crates/bpmnkit-diff/src/html.rs` (+ `html` feature), `packages/core/src/bpmn/diff-html.ts`
  (`renderDiffHtml(before, after, diff, opts): string`), `apps/cli/src/commands/diff.ts`
  (`--html <file>`, `--png <file>`), Playwright check script under `crates/bpmnkit-diff/tests/`
  or `packages/core/tests/` (open the file with network blocked, assert no requests, toggle
  modes, click a change).
- Done when: same HTML bytes from TS and Rust for the diff fixtures (conformance
  `expected/diff.html`); zero network requests; works with JS off; `spec-gen --check` clean.

### T5 — Facade ergonomics + lint report rendering + examples/docs  · model: **Sonnet** (Haiku for the docs page)

- Files: `crates/bpmnkit/{Cargo.toml,src/lib.rs,src/error.rs,src/detect.rs,examples/*}`,
  `crates/bpmnkit-lint/src/report.rs` (+ `pub mod report` line in its `lib.rs`),
  `apps/landing/src/content/docs/rust/embedding.md`, `doc/features.md`, `doc/roadmap.md`.
- API: `bpmnkit::Error`, `bpmnkit::detect`, `bpmnkit::load`, `bpmnkit::prelude`;
  `bpmnkit_lint::report::{to_text, to_markdown, to_slack_mrkdwn}`; features `render`,
  `render-png`, `render-system-fonts`, `diff`, `diff-html` (added once T1/T3 crates exist —
  land the error/detect/report work first, features in a second commit).
- Tests: `detect` on every conformance input kind; `Error` `From`/`Display`; report snapshots
  (text/markdown/mrkdwn, escaping of `<>&` for Slack); `cargo test --examples`.
- Done when: `cargo doc -p bpmnkit --all-features` has no warnings; examples run; docspack rebuilt.

| Task | Depends on | Parallel with | Model |
|---|---|---|---|
| T1 render (Rust) | fixtures from T2 for phase b (phase a uses its own default-option fixtures if T2 is late) | T2, T3, T5 | Opus |
| T2 svg v2 (TS) + recorder | — | T1, T3, T5 | Sonnet |
| T3 diff (Rust + TS) | — | T1, T2, T5 | Sonnet |
| T4 HTML viewer | T1a, T3 | T5 | Opus |
| T5 facade/lint report/docs | T1, T3 only for the feature lines | T1, T2, T3 | Sonnet |

Coordination note for T1/T2: the render fixture recorder belongs to T2. If T1 starts first,
it records the default-option cases itself into `conformance/render/` with the same recorder
file name (`packages/core/tests/render-conformance.test.ts`); whichever lands second rebases
and keeps the other's cases.
