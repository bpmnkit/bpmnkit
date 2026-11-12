---
title: One-File BPMN Viewer
description: Turn a .bpmn file into one self-contained HTML page that shows the diagram offline — with the casen export html command, the toHtml Node helper, or a string replace in Rust or any other language.
sidebar:
  order: 23
---

Send a process to someone who has no modeler: one `.html` file, no server, no CDN, no other files.
`@bpmnkit/viewer-lite` is an 8 KB (gzip) script that draws BPMN XML as a pannable, zoomable SVG,
small enough to inline into the page that carries the diagram.

<!-- docspack: tags=viewer-lite,html,single-file,export,self-contained,offline,bpmn,template,include_str -->

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

`toHtml(xml, { title? })` returns the page as a string. The XML sits inside
`<script type="application/bpmn+xml">`, where an HTML parser ends the element at the first
`</script`. `toHtml` hides it without changing what the XML parses to: in text it is already
`&lt;/script`, in CDATA the section is split and rejoined, in a comment it is escaped. XML with a real
`<script>` element cannot be inlined, and `toHtml` throws.

## From Rust or any other language

The package ships the finished page as `@bpmnkit/viewer-lite/template.html`, with the viewer inlined
and a `{{BPMN}}` placeholder where the XML goes. Copy it next to your code and replace the placeholder:

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
