# BPMN Kit Text — the line format — What it is

**BPMN Kit Text** (short: *bpmnkit text*) is the compact line format a language model writes a
process in. It is MIT licensed and ships in [`@bpmnkit/core`](/docs/packages/core).

- **Compact.** A path is written once as `a > b > c` and a node is declared inline the first time
  it is used. Ids, merge gateways and obvious gaps are left to the parser. It costs about a quarter
  of the tokens of minified compact JSON on the repo's own fixtures.
- **Streams line by line.** Every line is a complete fact, so a diagram can be drawn while the
  model is still writing it. JSON needs a brace scanner for that.
- **The parser never throws.** Anything it cannot use is reported as a `problem` and left out;
  what it adds to complete the diagram is listed in `fixes`. The result always expands to BPMN.

---
Source: https://bpmnkit.com/docs/guides/process-text
