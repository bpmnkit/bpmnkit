---
"@crates/bpmnkit-ascii": patch
"@crates/bpmnkit-bpmn": patch
"@crates/bpmnkit-builder": patch
"@crates/bpmnkit-compat": patch
"@crates/bpmnkit-diff": patch
"@crates/bpmnkit-dmn": patch
"@crates/bpmnkit-feel": patch
"@crates/bpmnkit-form": patch
"@crates/bpmnkit-layout": patch
"@crates/bpmnkit-lint": patch
"@crates/bpmnkit-render": patch
"@crates/bpmnkit-spec": patch
"@crates/bpmnkit-text": patch
"@crates/bpmnkit-xml": patch
"@crates/bpmnkit": patch
---

Releases are now driven by Changesets; the .crate no longer can pick up package.json.

Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
