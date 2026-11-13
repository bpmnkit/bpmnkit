---
"@bpmnkit/cli": minor
"@bpmnkit/core": minor
"@crates/bpmnkit-layout": patch
---

`casen build <spec>`: a text spec (pools, lanes, message flows, data), CompactDiagram JSON or a builder module becomes a laid-out `.bpmn` plus a form per user task, linted like c8ctl (each finding names its `.bpmnlintrc` key) and, with `--deploy`, deployed with its forms (env credentials like c8ctl). `--edit` changes an existing file and keeps its layout. casen no longer prints Node process warnings. Core: `attachUserTaskForms`, `parseFormFields`, `makeRoom`; data references stay in their task's lane, `bpmn:dataObject` gets no shape, and data elements need no lane in the builder.
