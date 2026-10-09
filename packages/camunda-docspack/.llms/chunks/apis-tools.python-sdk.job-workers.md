# Job Workers

# Job Workers

Job workers long-poll for available jobs, execute a callback, and automatically complete or fail the job based on the return value. Workers are available on `CamundaAsyncClient`.

Handlers receive a context object that includes a `client` reference, so your handler can make API calls during job execution. The context type depends on the execution strategy:

- **Async handlers** → `ConnectedJobContext` with `client: CamundaAsyncClient` (use `await`)
- **Thread handlers** → `SyncJobContext` with `client: CamundaClient` (call directly)
- **Process handlers** → plain `JobContext` (no client — cannot be pickled across process boundaries)

<!-- snippet-source: examples/readme.py | regions: ReadmeJobWorker -->

```python
import asyncio

from camunda_orchestration_sdk import CamundaAsyncClient, ConnectedJobContext, WorkerConfig

async def handle_job(job_context: ConnectedJobContext) -> dict[str, object]:
    variables = job_context.variables.to_dict()
    job_context.log.info(f"Processing job {job_context.job_key}: {variables}")
    return {"result": "processed"}

async def main() -> None:
    async with CamundaAsyncClient() as client:
        config = WorkerConfig(
            job_type="my-service-task",
            job_timeout_milliseconds=30_000,
        )
        client.create_job_worker(config=config, callback=handle_job)

        # Keep workers running until cancelled
        await client.run_workers()

asyncio.run(main())
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
