# @bpmnkit/core — Installation — `parseProcessText(text)` and `createProcessTextStream()` (2)

`createProcessTextStream()` reads the same format while it arrives. It reads each finished line
as it arrives, so every frame is built from whole facts. `push(chunk)` returns a laid-out frame,
or `null` when nothing new is drawable. `end()` returns what `parseProcessText` would.

---
Source: https://bpmnkit.com/docs/packages/core
