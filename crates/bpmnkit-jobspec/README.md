# bpmnkit-jobspec

Job worker IR for BPMN Kit: extracts job types, headers, I/O mappings and boundary errors from BPMN, binds OpenAPI operations, and classifies each job as connector, REST or worker by a fixed rule table (R1–R13).

## Install

```sh
cargo add bpmnkit-jobspec
```

## Usage

`bpmnkit worker classify process.bpmn` prints the classification this crate computes.

Part of [BPMN Kit](https://bpmnkit.com). MIT OR Apache-2.0.
