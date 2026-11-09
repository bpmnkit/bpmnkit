# bpmnkit-render

BPMN diagrams as SVG, with output byte-identical to the TypeScript implementation.

This is the Rust twin of `@bpmnkit/core` `exportSvg`. The TypeScript implementation is the oracle:
both are held to the same conformance cases (`conformance/render/`), so the SVG bytes match.
Models without diagram interchange are laid out first (feature `auto-layout`, on by default).

## Install

```sh
cargo add bpmnkit-render
```

## Example

```rust
use bpmnkit_render::{bpmn_xml_to_svg, RenderOptions, Theme};

let xml = std::fs::read_to_string("order.bpmn")?;
let svg = bpmn_xml_to_svg(&xml, &RenderOptions::default().theme(Theme::Dark))?;
std::fs::write("order.svg", svg.markup)?;
```

`Svg` also carries the viewBox, the output size and every drawn element with its DI geometry
(for overlays and click maps).

## Options

| Option | Default | Effect |
| --- | --- | --- |
| `theme` | `Light` | `Light`, `Dark` or `Custom(ThemeColors)` |
| `padding` | `20` | space around the diagram |
| `scale` | `1` | multiplies `width`/`height`; the viewBox stays |
| `max_size` | none | fit inside a box after `scale`, never enlarges |
| `plane` | `First` | `ById(diagram or plane id)`, `Process(element id)` |
| `auto_layout` | `true` | lay out when the chosen plane is empty |
| `font` | `system-ui,-apple-system,sans-serif`, 11 px, 14 px line | default label font |
| `element_ids` | `false` | `data-element-id` on each drawn element |
| `background` | `true` | `false` gives a transparent image |

## License

MIT OR Apache-2.0
