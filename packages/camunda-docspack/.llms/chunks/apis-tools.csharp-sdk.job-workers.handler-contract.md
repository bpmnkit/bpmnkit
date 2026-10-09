# Job Workers — Handler Contract

The handler return value determines the job outcome:

| Handler behavior              | Job outcome                                           |
| ----------------------------- | ----------------------------------------------------- |
| Return `object`               | Auto-complete with those variables                    |
| Return `null`                 | Auto-complete with no variables                       |
| Return `JobCompletionRequest` | Complete with structured result (corrections, denial) |
| Throw `BpmnErrorException`    | Trigger a BPMN error boundary event                   |
| Throw `JobFailureException`   | Fail with custom retries / back-off                   |
| Throw any other exception     | Auto-fail with `retries - 1`                          |

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: ErrorHandling+ErrorHandlingFailure -->

```csharp
// BPMN error — caught by error boundary events in the process model
throw new BpmnErrorException("INVALID_ORDER", "Order not found");

// Explicit failure with retry control
throw new JobFailureException("Service unavailable", retries: 2, retryBackOffMs: 5000);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
