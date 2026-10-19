---
"@bpmnkit/core": patch
---

Auto-layout writes `isMarkerVisible="true"` on exclusive gateways, so the bpmn-js Viewer draws their "X". Re-layout (`applyAutoLayout`, `Bpmn.autoLayout`) now recomputes geometry only: DI ids, gateway markers, colours and other vendor attributes on shapes, edges and labels, and the diagram's and plane's own attributes carry over from the input (#250).
