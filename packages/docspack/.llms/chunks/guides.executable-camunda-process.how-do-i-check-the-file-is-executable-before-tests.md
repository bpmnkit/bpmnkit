# Build an Executable Camunda Process — How do I check the file is executable before tests?

Lint the file before you write any test against it. `lintDiagram` is the library call, and
`casen lint lint <file> --profile deploy` is the command; render the file's XML with
`renderBpmnAscii` from `@bpmnkit/ascii` to read the shape.

```sh
casen lint lint process.bpmn --categories deploy,connector,agentic
```

`casen lint lint process.bpmn --profile deploy` runs every category and keeps the error-severity
findings, so a correct model reports 0 errors. The `pattern` rules `gateway-no-default-flow` and
`subprocess-no-error-boundary` are warnings (style advice): Camunda's own gate does not flag
them, and the reference file `expected.bpmn` trips both.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
