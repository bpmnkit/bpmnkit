# CPT test fixtures

`bakeoff.test.json` runs against `packages/core/tests/fixtures/bakeoff/expected.bpmn`. Its six case
names and instruction sequence mirror the test suite in
[camunda/camunda-8-tutorials](https://github.com/camunda/camunda-8-tutorials)
(`ai-agent-chat-with-tools`), so the runner is checked against the same flow CPT runs. That
repository states no licence, so its file is not copied here: the variable values are written for
BPMN Kit and the file is MIT like the rest of this repository.

`ad-hoc-tools.bpmn` is a minimal ad-hoc sub-process for the reebe-wasm job-result tests.
