---
title: One-File BPMN Viewer
description: Turn a .bpmn file into one self-contained HTML page that shows the diagram offline — with the casen export html command, the toHtml Node helper, the bpmnkit-viewer Rust crate, or a string replace in any other language.
sidebar:
  order: 23
---

Send a process to someone who has no modeler: one `.html` file, no server, no CDN, no other files.
`@bpmnkit/viewer-lite` is an 8 KB (gzip) script that draws BPMN XML as a pannable, zoomable SVG,
small enough to inline into the page that carries the diagram.

<!-- docspack: tags=viewer-lite,html,single-file,export,self-contained,offline,bpmn,template,include_str,rust,bpmnkit-viewer,to_html,embed -->

## From the CLI

```sh
casen export html order.bpmn                      # writes order.html next to the file
casen export html order.bpmn -o site/order.html --title "Order process"
```

The file has no layout (no `bpmndi` section)? The page shows a short message instead of a diagram:
lay it out first with `@bpmnkit/core`.

## From Node

```typescript
import { readFileSync, writeFileSync } from "node:fs"
import { toHtml } from "@bpmnkit/viewer-lite/html"

writeFileSync("order.html", toHtml(readFileSync("order.bpmn", "utf8"), { title: "Order process" }))
```

`toHtml(xml, { title?, theme?, colors? })` returns the page as a string. The XML sits inside
`<script type="application/bpmn+xml">`, where an HTML parser ends the element at the first
`</script`. `toHtml` hides it without changing what the XML parses to: in text it is already
`&lt;/script`, in CDATA the section is split and rejoined, in a comment it is escaped. XML with a real
`<script>` element cannot be inlined, and `toHtml` throws.

## Theme and brand colours

The viewer is light by default: dark strokes on a light page, whatever the reader's OS says. Opt in to
the other themes with `theme: "dark"` or `theme: "auto"` (follow `prefers-color-scheme`):

```typescript
toHtml(xml, { theme: "auto" })
toHtml(xml, { colors: { bg: "#101820", text: "#e8eef5", shapeStroke: "#0b5fff" } })
```

`colors` takes any of `bg`, `shapeFill`, `shapeStroke`, `flowStroke`, `text`, `poolHeader` and
`textHalo`, merged over the light theme. `toHtml` writes them as `--bpmnkit-viewer-*` CSS variables and
throws on a value that could break out of the CSS. In your own page, set the variables (`-bg`, `-fill`,
`-stroke`, `-flow`, `-text`, `-pool-header`, `-halo`; the halo defaults to the background) on the
element or an ancestor, or put `data-theme="light|dark|auto"` on the script. In code,
`render(xml, el, { theme })` also takes a partial palette, which wins over the variables.

From the shell: `casen export html order.bpmn --theme dark --color stroke=#0b5fff --color bg=#101820`.

## From Rust

The `bpmnkit-viewer` crate (no dependencies; also `bpmnkit` with the `viewer` feature) makes the
same page, byte for byte, as `toHtml`. The viewer script is inside the crate, so nothing is read at
run time:

```rust
use bpmnkit_viewer::{to_html, HtmlOptions};

let page = to_html(&xml, &HtmlOptions::default().title("Order process"))?;
std::fs::write("order.html", page)?; // or upload it, e.g. as a Slack file
```

`empty_html(&opts)` is the empty viewer with the picker; `HtmlOptions::default().no_picker()` leaves
the picker out. To show the diagram in a page you already serve, `parts(&xml, &opts)` returns the
three pieces and says where each goes:

```html
<head>  … {head} …     </head>   <!-- <style>; optional, it also sets the page background -->
<body>  … {body} …               <!-- the diagram; one per diagram (use no_picker for several) -->
        {scripts}      </body>   <!-- viewer + open/drop script; once per page -->
```

`VIEWER_JS`, `LOADER_JS` and `CSS` are the raw assets, for serving the scripts as files under a
Content-Security-Policy without inline scripts. A real `<script>` element in the XML is an error
(`ViewerError::ScriptElement`); `</script` in CDATA or a comment is escaped without changing the XML.

## From any other language

The package ships the finished page as `@bpmnkit/viewer-lite/template.html`, with the viewer inlined
and a `{{BPMN}}` placeholder where the XML goes. Copy it next to your code and replace the placeholder (shown in Rust; any language works the same):

```rust
const TEMPLATE: &str = include_str!("template.html");

fn to_html(xml: &str) -> String {
    // Hide `</script` from the HTML parser. Text is already `&lt;/script` in valid XML; this
    // covers CDATA and comments. Do this before the replace, or `{{BPMN}}` text inside the XML
    // gets replaced too.
    let xml = xml.replace("</script", "&lt;/script");
    TEMPLATE.replacen("{{BPMN}}", &xml, 1)
}
```

The page also has a file picker and accepts a dropped `.bpmn` file (a small second inline script, outside the 8 KB viewer script). Replace `{{BPMN}}` with nothing for a page that only shows "Open or drop a .bpmn file"; with `toHtml("")` the hint is built in.

`replacen(…, 1)` replaces only the first placeholder. This simple escape turns `</script` inside a CDATA
section into the literal text `&lt;/script`, which is fine for display but not byte-exact. Use `toHtml`
where that matters.

## Your own page

```html
<script type="application/bpmn+xml">
  <bpmn:definitions …>…</bpmn:definitions>
</script>
<script src="viewer-lite.min.js"></script>
```

Every `application/bpmn+xml` script on the page is replaced by its diagram.
