<div align="center">
  <a href="https://bpmnkit.com"><img src="https://bpmnkit.com/favicon.svg" width="72" height="72" alt="BPMN Kit logo"></a>
  <h1>@bpmnkit/cli-darwin-arm64</h1>
  <p>The bpmnkit native binary for Apple Silicon macOS. Installed by @bpmnkit/cli, not used directly</p>

  [![npm](https://img.shields.io/npm/v/@bpmnkit/cli-darwin-arm64?style=flat-square&color=6244d7)](https://www.npmjs.com/package/@bpmnkit/cli-darwin-arm64)
  [![license](https://img.shields.io/npm/l/@bpmnkit/cli-darwin-arm64?style=flat-square)](https://github.com/bpmnkit/bpmnkit/blob/main/LICENSE)
  [![typescript](https://img.shields.io/badge/TypeScript-strict-6244d7?style=flat-square&logo=typescript&logoColor=white)](https://github.com/bpmnkit/bpmnkit)
  [![ai-assisted](https://img.shields.io/badge/AI--assisted-claude-8b5cf6?style=flat-square)](https://github.com/bpmnkit/bpmnkit)
  [![tier: core](https://img.shields.io/badge/tier-core-16a34a?style=flat-square)](https://bpmnkit.com/docs/getting-started/stability#product-tiers)

  [Website](https://bpmnkit.com) · [Documentation](https://bpmnkit.com/docs) · [GitHub](https://github.com/bpmnkit/bpmnkit) · [Changelog](https://github.com/bpmnkit/bpmnkit/blob/main/packages/cli-darwin-arm64/CHANGELOG.md)
</div>

> **Core tier.** Semver at 1.0: nothing breaks without a major release. See [product tiers](https://bpmnkit.com/docs/getting-started/stability#product-tiers).

---

## Overview

`@bpmnkit/cli-darwin-arm64` carries the `bpmnkit` binary for Apple Silicon macOS. `@bpmnkit/cli` lists it as an optional dependency, and npm installs only the one matching your `os` and `cpu`.

## Installation

```sh
npm install -g @bpmnkit/cli
```

## Quick Start

```sh
bpmnkit --version
```

## API Reference

No API. The package contains `bin/bpmnkit`. See [@bpmnkit/cli](https://bpmnkit.com/docs/cli/casen).

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
| [`@bpmnkit/viewer-lite`](https://www.npmjs.com/package/@bpmnkit/viewer-lite) | 8.5 KB BPMN viewer for one self-contained HTML file |
| [`@bpmnkit/docspack`](https://www.npmjs.com/package/@bpmnkit/docspack) | BPMN Kit docs as an offline docspack package for AI agents |
| [`@bpmnkit/camunda-docspack`](https://www.npmjs.com/package/@bpmnkit/camunda-docspack) | Camunda 8 docs as an offline docspack package for AI agents |
| [`@bpmnkit/ui`](https://www.npmjs.com/package/@bpmnkit/ui) | Shared design tokens and UI components |
| [`@bpmnkit/profiles`](https://www.npmjs.com/package/@bpmnkit/profiles) | Shared auth, profile storage, and client factories for CLI & proxy |
| [`@bpmnkit/operate`](https://www.npmjs.com/package/@bpmnkit/operate) | Monitoring & operations frontend for Camunda clusters |
| [`@bpmnkit/connector-gen`](https://www.npmjs.com/package/@bpmnkit/connector-gen) | Generate connector templates from OpenAPI specs |
| [`@bpmnkit/connectors`](https://www.npmjs.com/package/@bpmnkit/connectors) | Camunda 8 OOTB connector catalog and deterministic template application |
| [`@bpmnkit/cli`](https://www.npmjs.com/package/@bpmnkit/cli) | Camunda 8 command-line interface (bpmnkit, alias casen) |
| [`@bpmnkit/cli-legacy`](https://www.npmjs.com/package/@bpmnkit/cli-legacy) | Node fallback behind the native bpmnkit binary |
| [`@bpmnkit/proxy`](https://www.npmjs.com/package/@bpmnkit/proxy) | Local AI bridge and Camunda API proxy server |
| [`@bpmnkit/patterns`](https://www.npmjs.com/package/@bpmnkit/patterns) | Domain process patterns for BPMNKit AIKit |
| [`@bpmnkit/reebe-wasm`](https://www.npmjs.com/package/@bpmnkit/reebe-wasm) | WebAssembly BPMN engine for browser simulation |
| [`@bpmnkit/worker-client`](https://www.npmjs.com/package/@bpmnkit/worker-client) | Thin Zeebe REST client for standalone workers |
| [`@bpmnkit/flow`](https://www.npmjs.com/package/@bpmnkit/flow) | Code-first durable flows that derive BPMN, job types and workers |
| [`@bpmnkit/user-tasks`](https://www.npmjs.com/package/@bpmnkit/user-tasks) | Embeddable user task widget for Camunda 8 |
| [`@bpmnkit/cli-sdk`](https://www.npmjs.com/package/@bpmnkit/cli-sdk) | Plugin authoring SDK for the bpmnkit CLI |
| [`@bpmnkit/create-casen-plugin`](https://www.npmjs.com/package/@bpmnkit/create-casen-plugin) | Scaffold a new bpmnkit CLI plugin in seconds |
| [`@bpmnkit/casen-report`](https://www.npmjs.com/package/@bpmnkit/casen-report) | HTML reports from Camunda 8 incident and SLA data |
| [`@bpmnkit/casen-worker-http`](https://www.npmjs.com/package/@bpmnkit/casen-worker-http) | Example HTTP worker plugin — completes jobs with live JSONPlaceholder API data |
| [`@bpmnkit/casen-worker-ai`](https://www.npmjs.com/package/@bpmnkit/casen-worker-ai) | AI task worker — classify, summarize, extract, and decide using Claude |

## License

[MIT](https://github.com/bpmnkit/bpmnkit/blob/main/LICENSE) © BPMN Kit — made by [u11g](https://u11g.com)

<div align="center">
  <a href="https://bpmnkit.com"><img src="https://bpmnkit.com/favicon.svg" width="32" height="32" alt="BPMN Kit"></a>
</div>
