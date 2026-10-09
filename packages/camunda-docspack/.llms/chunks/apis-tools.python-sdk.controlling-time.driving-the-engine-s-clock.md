# Controlling time — Driving the engine's clock

A process that only completes after a BPMN timer fires has two clocks to satisfy: the
engine's and your client's. Moving either alone does not help -- pin the engine and your
worker keeps waiting on real time; drive the worker and the engine never reaches the timer.

`EngineClock` moves both. Each wait pins the engine forward to that wait's wake instant, so
a process spanning a minute of engine time finishes in real milliseconds.

> [!WARNING]
> Pinning stops time for **everything on that cluster**, not just your client. Use it only
> against a cluster you own -- a local one, or a disposable test instance -- never a shared
> or production environment. Always `reset()` in a `finally`, after the client and any
> workers using the clock have stopped; leaving without it leaves the engine frozen for
> whoever comes next.

<!-- snippet-source: examples/readme.py | regions: ReadmeEngineClock -->

```python
from camunda_orchestration_sdk import (
    CamundaAsyncClient,
    ConnectedJobContext,
    EngineClock,
    WorkerConfig,
)

async def handle_job(job_context: ConnectedJobContext) -> dict[str, object]:
    # Waiting here moves the engine's clock too, so a BPMN timer downstream fires
    # without anyone waiting out the real duration.
    await job_context.clock.sleep(60)
    return {"result": "processed"}

# Drive the engine from a separate client: pinning issues a request, and that request's
# own backoff must not wait on the clock issuing it.
async with CamundaAsyncClient() as driver:
    # Pins on entry and resets on exit -- including when the client below fails to
    # build, or fails to shut down. Written by hand as a single `finally`, either of
    # those leaves the cluster frozen.
    async with EngineClock(driver) as engine:
        async with CamundaAsyncClient(clock=engine) as client:
            client.create_job_worker(
                config=WorkerConfig(job_type="payment", job_timeout_milliseconds=30_000),
                callback=handle_job,
            )
            await client.run_workers()
```

Overlapping waits settle at a shared wake instant rather than accumulating, so ten handlers
each waiting a second advance the engine by a second -- as real sleeps would. `pin(at)` and
`reset()` are control operations and may move time backwards; waits never do.

Because `PUT /clock` is write-only, the clock mirrors what it last pinned. That mirror is
accurate only while nothing else pins the same engine: use one `EngineClock` per engine.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/controlling-time
