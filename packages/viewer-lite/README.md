<div align="center">
  <a href="https://bpmnkit.com"><img src="https://bpmnkit.com/favicon.svg" width="72" height="72" alt="BPMN Kit logo"></a>
  <h1>@bpmnkit/viewer-lite</h1>
  <p>Dependency-free BPMN viewer for one self-contained HTML file — an 8 KB script that turns embedded BPMN XML into a pannable, zoomable SVG</p>

  [![npm](https://img.shields.io/npm/v/@bpmnkit/viewer-lite?style=flat-square&color=6244d7)](https://www.npmjs.com/package/@bpmnkit/viewer-lite)
  [![license](https://img.shields.io/npm/l/@bpmnkit/viewer-lite?style=flat-square)](https://github.com/bpmnkit/bpmnkit/blob/main/LICENSE)
  [![typescript](https://img.shields.io/badge/TypeScript-strict-6244d7?style=flat-square&logo=typescript&logoColor=white)](https://github.com/bpmnkit/bpmnkit)
  [![ai-assisted](https://img.shields.io/badge/AI--assisted-claude-8b5cf6?style=flat-square)](https://github.com/bpmnkit/bpmnkit)
  [![tier: tools](https://img.shields.io/badge/tier-tools-2563eb?style=flat-square)](https://bpmnkit.com/docs/getting-started/stability#product-tiers)

  [Website](https://bpmnkit.com) · [Documentation](https://bpmnkit.com/docs) · [GitHub](https://github.com/bpmnkit/bpmnkit) · [Changelog](https://github.com/bpmnkit/bpmnkit/blob/main/packages/viewer-lite/CHANGELOG.md)
</div>

> **Tools tier.** Maintained, on 0.x: a minor release can break, so pin a version. See [product tiers](https://bpmnkit.com/docs/getting-started/stability#product-tiers).

---

## Overview

`@bpmnkit/viewer-lite` draws a BPMN 2.0 diagram in the browser with no dependencies, small enough (under 8 KB gzip) to inline into the HTML file that carries the diagram. One file, no server, no CDN: e-mail it, attach it to a ticket, open it offline.

It uses the same SVG renderer as `@bpmnkit/core`'s `exportSvg`, fed by a small `DOMParser` reader instead of the full parser.

## Features

- **One HTML file** — `dist/template.html` inlines the viewer; put the XML in place of `{{BPMN}}`
- **Auto-boot** — every `<script type="application/bpmn+xml">` on the page is replaced by its diagram
- **Fit, pan and zoom** — fits the width on load; drag to pan, wheel to zoom
- **Light and dark** — follows `prefers-color-scheme`
- **Same drawing as core** — tested against every conformance fixture
- **Size gate** — the build fails when the minified script is over 8 KB gzip

## Installation

```sh
npm install @bpmnkit/viewer-lite
```

## Quick Start

A self-contained page from the template (in XML text, write `</script` as `&lt;/script`):

```typescript
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const template = readFileSync(require.resolve("@bpmnkit/viewer-lite/template.html"), "utf8")
const xml = readFileSync("order.bpmn", "utf8").replaceAll("</script", "&lt;/script")
writeFileSync("order.html", template.replace("{{BPMN}}", () => xml))
```

Or in your own page:

```html
<script type="application/bpmn+xml">
  <bpmn:definitions …>…</bpmn:definitions>
</script>
<script src="viewer-lite.min.js"></script>
```

## API Reference

```typescript
// ESM: import { render, boot, parseBpmnLite } from "@bpmnkit/viewer-lite"
// IIFE: window.BpmnLite.render / .boot / .parseBpmnLite
function render(xml: string, el: Element, options?: RenderOptions): boolean  // false: message shown
function boot(root?: ParentNode): void            // replace application/bpmn+xml scripts
function parseBpmnLite(xml: string): BpmnDefinitions  // the fields exportSvg draws

interface RenderOptions {
  theme?: "light" | "dark"   // default: prefers-color-scheme
  interactive?: boolean      // drag to pan, wheel to zoom; default true
}
```

A file without diagram layout (`bpmndi`) shows a short message; lay it out first with `@bpmnkit/core`. Label fonts from `bpmndi:BPMNLabelStyle` and DI colours are not drawn.
---

## Related Packages

| Package | Description |
|---------|-------------|
| [`@bpmnkit/core`](https://www.npmjs.com/package/@bpmnkit/core) | BPMN/DMN/Form parser, builder, layout engine |
| [`@bpmnkit/canvas`](https://www.npmjs.com/package/@bpmnkit/canvas) | Zero-dependency SVG BPMN viewer |
| [`@bpmnkit/editor`](https://www.npmjs.com/package/@bpmnkit/editor) | Full-featured interactive BPMN editor |
| [`@bpmnkit/engine`](https://www.npmjs.com/package/@bpmnkit/engine) | Lightweight BPMN process simulator for tests and demos |
| [`@bpmnkit/feel`](https://www.npmjs.com/package/@bpmnkit/feel) | FEEL expression language parser & evaluator |
| [`@bpmnkit/plugins`](https://www.npmjs.com/package/@bpmnkit/plugins) | 34 composable canvas plugins |
| [`@bpmnkit/api`](https://www.npmjs.com/package/@bpmnkit/api) | Camunda 8 REST API TypeScript client |
| [`@bpmnkit/ascii`](https://www.npmjs.com/package/@bpmnkit/ascii) | Render BPMN diagrams as Unicode ASCII art |
| [`@bpmnkit/markdown`](https://www.npmjs.com/package/@bpmnkit/markdown) | BPMN diagrams in Markdown — remark, markdown-it and README pre-rendering |
| [`@bpmnkit/docspack`](https://www.npmjs.com/package/@bpmnkit/docspack) | BPMN Kit docs as an offline docspack package for AI agents |
| [`@bpmnkit/camunda-docspack`](https://www.npmjs.com/package/@bpmnkit/camunda-docspack) | Camunda 8 docs as an offline docspack package for AI agents |
| [`@bpmnkit/ui`](https://www.npmjs.com/package/@bpmnkit/ui) | Shared design tokens and UI components |
| [`@bpmnkit/profiles`](https://www.npmjs.com/package/@bpmnkit/profiles) | Shared auth, profile storage, and client factories for CLI & proxy |
| [`@bpmnkit/operate`](https://www.npmjs.com/package/@bpmnkit/operate) | Monitoring & operations frontend for Camunda clusters |
| [`@bpmnkit/connector-gen`](https://www.npmjs.com/package/@bpmnkit/connector-gen) | Generate connector templates from OpenAPI specs |
| [`@bpmnkit/connectors`](https://www.npmjs.com/package/@bpmnkit/connectors) | Camunda 8 OOTB connector catalog and deterministic template application |
| [`@bpmnkit/cli`](https://www.npmjs.com/package/@bpmnkit/cli) | Camunda 8 command-line interface (casen) |
| [`@bpmnkit/proxy`](https://www.npmjs.com/package/@bpmnkit/proxy) | Local AI bridge and Camunda API proxy server |
| [`@bpmnkit/patterns`](https://www.npmjs.com/package/@bpmnkit/patterns) | Domain process patterns for BPMNKit AIKit |
| [`@bpmnkit/reebe-wasm`](https://www.npmjs.com/package/@bpmnkit/reebe-wasm) | WebAssembly BPMN engine for browser simulation |
| [`@bpmnkit/worker-client`](https://www.npmjs.com/package/@bpmnkit/worker-client) | Thin Zeebe REST client for standalone workers |
| [`@bpmnkit/flow`](https://www.npmjs.com/package/@bpmnkit/flow) | Code-first durable flows that derive BPMN, job types and workers |
| [`@bpmnkit/user-tasks`](https://www.npmjs.com/package/@bpmnkit/user-tasks) | Embeddable user task widget for Camunda 8 |
| [`@bpmnkit/cli-sdk`](https://www.npmjs.com/package/@bpmnkit/cli-sdk) | Plugin authoring SDK for the casen CLI |
| [`@bpmnkit/create-casen-plugin`](https://www.npmjs.com/package/@bpmnkit/create-casen-plugin) | Scaffold a new casen CLI plugin in seconds |
| [`@bpmnkit/casen-report`](https://www.npmjs.com/package/@bpmnkit/casen-report) | HTML reports from Camunda 8 incident and SLA data |
| [`@bpmnkit/casen-worker-http`](https://www.npmjs.com/package/@bpmnkit/casen-worker-http) | Example HTTP worker plugin — completes jobs with live JSONPlaceholder API data |
| [`@bpmnkit/casen-worker-ai`](https://www.npmjs.com/package/@bpmnkit/casen-worker-ai) | AI task worker — classify, summarize, extract, and decide using Claude |

## License

[MIT](https://github.com/bpmnkit/bpmnkit/blob/main/LICENSE) © BPMN Kit — made by [u11g](https://u11g.com)

<div align="center">
  <a href="https://bpmnkit.com"><img src="https://bpmnkit.com/favicon.svg" width="32" height="32" alt="BPMN Kit"></a>
</div>
