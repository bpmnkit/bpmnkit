# Job Workers — Execution Strategies

Job workers support multiple execution strategies to match your workload type. Pass `execution_strategy` as a keyword argument to `create_job_worker`, or let the SDK auto-detect.

| Strategy           | How it runs your handler                                                       | Context type                              | Best for                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `"auto"` (default) | Auto-detects: `"async"` for `async def` handlers, `"thread"` for sync handlers | `ConnectedJobContext` or `SyncJobContext` | Most use cases — sensible defaults without configuration                                                             |
| `"async"`          | Runs on the main `asyncio` event loop                                          | `ConnectedJobContext` (async client)      | I/O-bound async work (HTTP calls, database queries). Best throughput for handlers that call remote systems over HTTP |
| `"thread"`         | Runs in a `ThreadPoolExecutor`                                                 | `SyncJobContext` (sync client)            | CPU-bound work, blocking I/O (file system, synchronous HTTP libraries)                                               |
| `"process"`        | Runs in a `ProcessPoolExecutor`                                                | `JobContext` (no client)                  | Heavy CPU-bound work that needs to escape the GIL (image processing, ML inference)                                   |

> **Choosing between `"async"` and `"thread"`:** If your job handler makes HTTP calls to remote systems (APIs, databases, microservices), `"async"` delivers the best performance — it can multiplex many concurrent jobs on a single thread without blocking. Use `"thread"` when your handler performs CPU-bound computation or calls synchronous libraries that would block the event loop.

**Auto-detection logic:** If your handler is an `async def`, the strategy defaults to `"async"`. If it's a regular `def`, the strategy defaults to `"thread"`. You can override this explicitly:

<!-- snippet-source: examples/readme.py | regions: ReadmeExecutionStrategies -->

```python
from camunda_orchestration_sdk import SyncJobContext, JobContext

# Force thread pool for a sync handler (receives SyncJobContext)
def io_handler(job: SyncJobContext) -> dict[str, object]:
    return {"done": True}

client.create_job_worker(
    config=WorkerConfig(job_type="io-bound-task", job_timeout_milliseconds=30_000),
    callback=io_handler,
    execution_strategy="thread",
)

# Force process pool for CPU-heavy work (receives plain JobContext)
def cpu_handler(job: JobContext) -> dict[str, object]:
    return {"computed": True}

client.create_job_worker(
    config=WorkerConfig(job_type="image-processing", job_timeout_milliseconds=120_000),
    callback=cpu_handler,
    execution_strategy="process",
)
```

**Process strategy caveats:** The `"process"` strategy serialises (pickles) your handler and its context to send them to a worker process. Because the SDK client cannot be pickled, handlers running under this strategy receive a plain `JobContext` (without a `client` attribute) instead of `ConnectedJobContext`/`SyncJobContext`. This means:

- Your handler function and its closure must be picklable (top-level functions work; lambdas and closures over unpicklable objects do not).
- Your handler must accept `JobContext`, not `ConnectedJobContext` or `SyncJobContext` — the type checker enforces this via overloaded signatures on `create_job_worker`.
- `job.log` degrades to a silent no-op logger in the child process (see [Job Logger](#job-logger)).
- There is additional overhead per job from serialisation and inter-process communication.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
