# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — Function bpmnError

Returns a context entry with an `errorType`, `errorCode` and `errorMessage`.

- parameters:
  - `errorCode`: string
  - `errorMessage`: string (optional)
- result: context

```feel
bpmnError("123", "error received")
// { errorType: "bpmnError", errorCode: "123", errorMessage: "error received" }

bpmnError("123")
// { errorType: "bpmnError", errorCode: "123" }
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
