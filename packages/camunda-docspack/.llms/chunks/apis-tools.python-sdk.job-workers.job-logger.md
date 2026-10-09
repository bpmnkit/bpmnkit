# Job Workers — Job Logger

Each `JobContext` exposes a `log` property — a scoped logger automatically bound with the job's context (job type, worker name, and job key). Use it inside your handler for structured, per-job log output:

<!-- snippet-source: examples/readme.py | regions: ReadmeJobLogger -->

```python
async def handler(job: ConnectedJobContext) -> dict[str, object]:
    job.log.info(f"Starting work on {job.job_key}")
    # ... do work ...
    job.log.debug("Work completed successfully")
    return {"done": True}
```

The job logger inherits the SDK's logger configuration (loguru by default, or whatever you passed via `logger=`). If you injected a custom logger into the client, job handlers will use a child of that same logger.

> **Note:** When using the `"process"` execution strategy, the job logger silently degrades to a no-op (`NullLogger`) because loggers cannot be pickled across process boundaries. The worker's main-process logger still records all job lifecycle events (activation, completion, failure, errors). If you need per-job logging from a process-isolated handler, configure a logger inside the handler itself.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
