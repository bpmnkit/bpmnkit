---
"@bpmnkit/core": minor
"@bpmnkit/cli": minor
---

Add `renderDiffHtml(before, after, diff, options)`, a self-contained HTML diff viewer (both diagrams with highlighted changes, side by side or overlaid, change list, no network), and `diffToSvg(after, diff)`, the later diagram with the changes drawn over it. `casen diff bpmn` gets `--html <file>` and `--png <file>`.
