---
"@bpmnkit/core": minor
"@bpmnkit/cli": minor
"@crates/bpmnkit-layout": minor
"@crates/bpmnkit-text": minor
---

Line format: `decision=<id>` on rule tasks, else the decision id is the name kebab-cased. `expand` writes `xsi:type="bpmn:tFormalExpression"` on conditions. Layout: black-box pools prefer the stack's edges, message flows get labels in the band between pools, event names move off a docking message flow. `casen build`: message throws keep `messageRef` (keyed like the process's catches), one `bpmn:dataStore` per name across pools, a plain start a message flow reaches becomes a message start.
