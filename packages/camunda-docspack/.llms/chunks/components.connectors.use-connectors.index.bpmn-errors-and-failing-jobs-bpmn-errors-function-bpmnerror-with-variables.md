# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — Function bpmnError with variables

Returns a context entry with an `errorType`, `errorCode`, `errorMessage`, and `variables`.

- Parameters:
  - `errorCode`: string
  - `errorMessage`: string
  - `variables`: context
- Result: context

```feel
bpmnError("123", "error received", {myVar: myValue})
// { errorType: "bpmnError", errorCode: "123", errorMessage: "error received", variables: {myVar: myValue}}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
