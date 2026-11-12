---
"@bpmnkit/viewer-lite": patch
"@crates/bpmnkit-viewer": patch
---

`viewer-lite.min.js` no longer throws when imported where there is no `document` (Node, SSR); it only sets the `BpmnLite` global there.
