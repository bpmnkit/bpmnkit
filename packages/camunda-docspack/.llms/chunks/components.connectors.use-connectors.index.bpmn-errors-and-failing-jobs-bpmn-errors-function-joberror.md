# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — Function jobError

Returns a context entry with an `errorType`, `errorMessage`, `variables`, `retries`, and `retryBackoff`.

- Parameters:
  - `errorMessage`: string
  - `variables`: context _(optional), default_ `{}`
  - `retries`: number _(optional), default_ `0`
  - `retryBackoff`: days-time-duration _(optional), default_ `PT0S`
- Result: context

Optional parameters can be omitted if no parameter needs to be set after.

```feel
jobError("job failed", {myVar: myValue}, 2, @"PT30S")
// { errorType: "jobError", errorMessage: "job failed", variables: {myVar: myValue}, retries: 2, retryBackoff: @"PT30S" }
```

```feel
jobError("job failed", {myVar: myValue}, 2)
// { errorType: "jobError", errorMessage: "job failed", variables: {myVar: myValue}, retries: 2, retryBackoff: @"PT0S" }
```

```feel
jobError("job failed", {myVar: myValue})
// { errorType: "jobError", errorMessage: "job failed", variables: {myVar: myValue}, retries: 0, retryBackoff: @"PT0S" }
```

```feel
jobError("job failed")
// { errorType: "jobError", errorMessage: "job failed", variables: {}, retries: 0, retryBackoff: @"PT0S" }
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
