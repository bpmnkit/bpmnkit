# bpmnkit-render

BPMN diagrams, DRDs and decision tables as SVG (byte-identical to the TypeScript implementation)
and PNG.

This is the Rust twin of `@bpmnkit/core` `exportSvg`, `exportDrdSvg` and `exportDecisionTableSvg`. The TypeScript implementation is the oracle:
both are held to the same conformance cases (`conformance/render/`), so the SVG bytes match.
With `auto_layout(true)`, models without diagram interchange are laid out first (feature
`auto-layout`, on by default).

## Install

```sh
cargo add bpmnkit-render
```

## Example

```rust
use bpmnkit_render::{bpmn_xml_to_svg, RenderOptions, Theme};

let xml = std::fs::read_to_string("order.bpmn")?;
let svg = bpmn_xml_to_svg(&xml, &RenderOptions::default().theme(Theme::Dark).auto_layout(true))?;
std::fs::write("order.svg", svg.markup)?;
```

`Svg` also carries the viewBox, the output size and every drawn element with its DI geometry
(for overlays and click maps), and warnings (`AutoLayoutApplied`, `ElementWithoutDi`).

## Options

| Option | Default | Effect |
| --- | --- | --- |
| `theme` | `Light` | `Light`, `Dark` or `Custom(ThemeColors)` |
| `padding` | `20` | space around the diagram |
| `scale` | `1` | multiplies `width`/`height`; the viewBox stays |
| `max_size` | none | fit inside a box after `scale`, never enlarges |
| `colors` | `Ignore` | `Di` honours `bioc:`/`color:` fill and stroke |
| `plane` | `First` | `ById(diagram or plane id)`, `Process(element id)` |
| `auto_layout` | `false` | lay out when the default plane has no shapes |
| `font` | `system-ui,-apple-system,sans-serif`, 11 px, 14 px line | default label font |
| `element_ids` | `false` | `data-element-id` on each drawn element |
| `background` | `true` | `false` gives a transparent image |

## PNG

```toml
bpmnkit-render = { version = "0.1", features = ["png"] }
```

```rust
use bpmnkit_render::{bpmn_xml_to_svg, svg_to_png, PngOptions, RenderOptions};

// A chat thumbnail: at most 800×600 CSS px, drawn at 2× for high-DPI screens.
let opts = RenderOptions::default().auto_layout(true).max_size(800.0, 600.0);
let svg = bpmn_xml_to_svg(&xml, &opts)?;
let png: Vec<u8> = svg_to_png(&svg, &PngOptions::default())?;
```

Glyphs come from a bundled Inter subset (Latin, Latin-1, Latin Extended-A; SIL OFL 1.1, see
`assets/fonts/OFL.txt`), so the PNG is the same on every machine, including containers without
fonts. CJK and emoji need feature `system-fonts` and `FontSource::System` or `FontSource::Both`.
`PngOptions::max_pixels` (default 16 M) turns a huge diagram into `RenderError::TooLarge` instead of
a large allocation. `png` + `embedded-font` builds for `wasm32-unknown-unknown`.

| Feature | Default | Adds |
| --- | --- | --- |
| `auto-layout` | yes | `RenderOptions::auto_layout` |
| `dmn` | no | `drd_to_svg`, `decision_table_to_svg` (DRD and decision-table images) |
| `png` | no | `svg_to_png`, `bpmn_to_png` (resvg, about 2 MB, embedded font) |
| `system-fonts` | no | the machine's fonts |

## License

MIT OR Apache-2.0. The bundled font is Inter, under the SIL Open Font License 1.1.
