# Wasm Job Workers — Build stage timing

Measured with the debug test build in the cloud container, scaffold worker, on the WP4 branch.
The shared target directory was cold for the first row and warm for the rest.

| Stage | Time |
| --- | --- |
| Render project | 1 ms |
| `check` (cargo check) | 18.3 s cold, 0.36 s warm |
| `build` (release to wasm32-wasip2) | 14.6 s |
| Verify imports | 0 ms |
| Smoke test (`test`) | 2.6 s (3.1 s warm) |
| Package | 3 ms |
| Total, cold | 35.5 s |

A release build of a real worker will take longer than the scaffold. The 1 to 2 minute target in
[the design notes](https://github.com/bpmnkit/bpmnkit/blob/main/doc/wasm-workers/concept.md) is for
the full agent loop, not for one build.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
