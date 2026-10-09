# Job Workers — Throwing a BPMN Error

To throw a [BPMN error](https://docs.camunda.io/docs/next/components/modeler/bpmn/error-events/error-events) from a job handler — for example, to trigger an error boundary event — raise `JobError`:

<!-- snippet-source: examples/readme.py | regions: ReadmeBpmnError -->

```python
from camunda_orchestration_sdk import ConnectedJobContext, JobError

async def handle_payment(job: ConnectedJobContext) -> dict[str, object]:
    variables = job.variables.to_dict()
    if variables.get("amount", 0) > 10_000:
        raise JobError(error_code="AMOUNT_TOO_HIGH", message="Payment exceeds limit")
    return {"status": "approved"}
```

| Parameter    | Default      | Description                                                    |
| ------------ | ------------ | -------------------------------------------------------------- |
| `error_code` | _(required)_ | The error code that is matched against BPMN error catch events |
| `message`    | `""`         | An optional error message for logging/diagnostics              |

The `error_code` must match the error code defined on a BPMN error catch event in your process model. If no catch event matches, the job becomes an incident.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
