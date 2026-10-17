# Build an Executable Camunda Process — How do I check the file is executable before tests?

Lint the file before you write any test against it. `lintDiagram` is the library call, and
`casen lint lint <file> --profile deploy` is the command; render the file's XML with
`renderBpmnAscii` from `@bpmnkit/ascii` to read the shape.

```sh
casen lint lint process.bpmn --categories deploy,connector,agentic
```

Use the engine categories (`deploy`, `connector`, `agentic`) as the deployability gate: they
hold the checks that decide whether Camunda accepts the file. `--profile deploy` runs every
category and keeps the error-severity findings, so it also reports the `pattern` rules
`gateway-no-default-flow` and `subprocess-no-error-boundary`. On the spec-compliant bake-off
process those two are style advice that Camunda's own gate does not flag, and the reference
file `expected.bpmn` trips both. Fix them if you want a clean deploy profile, or gate on the
engine categories.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
