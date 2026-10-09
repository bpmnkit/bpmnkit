# Controlling time — Waiting inside a handler

`ConnectedJobContext` and `SyncJobContext` carry the worker's clock, so a handler that needs
to wait can do it on the same clock as everything else:

<!-- snippet-source: examples/readme.py | regions: ReadmeHandlerWait -->

```python
from camunda_orchestration_sdk import ConnectedJobContext

async def handle_job(job: ConnectedJobContext) -> dict[str, object]:
    # Short coordination only -- a business wait belongs in the process as a BPMN timer.
    await job.clock.sleep(0.5)
    return {"result": "processed"}

```

Keep those waits short -- spacing a retry, letting a resource settle. **A long or business
wait belongs in the process as a BPMN timer event, not in a handler.** A handler that sleeps
for minutes holds a worker slot for the duration, risks the job timeout expiring underneath
it, and hides the delay from the process model, where it would otherwise be visible and
changeable without a redeploy.

`process`-strategy handlers get a plain `JobContext` with no clock: that context is pickled
across a process boundary, which a clock cannot cross. Handlers that need one should use the
`async` or `thread` strategy.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/controlling-time
