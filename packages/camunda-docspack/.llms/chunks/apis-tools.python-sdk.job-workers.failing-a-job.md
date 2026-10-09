# Job Workers — Failing a Job

To explicitly fail a job with a custom error message, retry count, and backoff, raise `JobFailure` in your handler:

<!-- snippet-source: examples/readme.py | regions: ReadmeFailJob -->

```python
from camunda_orchestration_sdk import ConnectedJobContext, JobFailure

async def handle_job(job: ConnectedJobContext) -> dict[str, object]:
    if not job.variables.to_dict().get("required_field"):
        raise JobFailure(
            message="Missing required field",
            retries=2,
            retry_back_off=5000,  # milliseconds
        )
    return {"result": "ok"}
```

| Parameter        | Default      | Description                                                       |
| ---------------- | ------------ | ----------------------------------------------------------------- |
| `message`        | _(required)_ | Error message attached to the failure                             |
| `retries`        | `None`       | Remaining retries. `None` decrements the current retry count by 1 |
| `retry_back_off` | `0`          | Backoff before the next retry, in milliseconds                    |

If an unhandled exception escapes your handler, the job is automatically failed with the exception message and the retry count decremented by 1.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
