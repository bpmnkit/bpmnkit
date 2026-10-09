# Job Workers — Worker Configuration

`WorkerConfig` supports:

| Parameter                      | Default                             | Description                                    |
| ------------------------------ | ----------------------------------- | ---------------------------------------------- |
| `job_type`                     | _(required)_                        | The BPMN service task type to poll for         |
| `job_timeout_milliseconds`     | env / _(required)_                  | How long the worker has to complete the job    |
| `request_timeout_milliseconds` | env / `0`                           | Long-poll request timeout (0 = server default) |
| `max_concurrent_jobs`          | env / `10`                          | Maximum jobs executing concurrently            |
| `fetch_variables`              | `None`                              | List of variable names to fetch (None = all)   |
| `worker_name`                  | env / `"camunda-python-sdk-worker"` | Identifier for this worker in Camunda          |

The following are keyword-only arguments on `create_job_worker`, not part of `WorkerConfig`:

| Parameter                    | Default   | Description                                                                                                                                                                                                                                               |
| ---------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `execution_strategy`         | `"auto"`  | `"auto"`, `"async"`, `"thread"`, or `"process"`. Controls how the handler is invoked and which context type it receives.                                                                                                                                  |
| `startup_jitter_max_seconds` | env / `0` | Maximum random delay (in seconds) before the worker starts polling. When multiple application instances restart simultaneously, this spreads out initial activation requests to avoid saturating the server. A value of `0` (the default) means no delay. |

### Heritable Worker Defaults

Worker configuration fields marked "env" in the table above can be set globally via environment variables or the client constructor. Individual `WorkerConfig` values take precedence.

| Environment variable                        | Maps to                        |
| ------------------------------------------- | ------------------------------ |
| `CAMUNDA_WORKER_TIMEOUT`                    | `job_timeout_milliseconds`     |
| `CAMUNDA_WORKER_MAX_CONCURRENT_JOBS`        | `max_concurrent_jobs`          |
| `CAMUNDA_WORKER_REQUEST_TIMEOUT`            | `request_timeout_milliseconds` |
| `CAMUNDA_WORKER_NAME`                       | `worker_name`                  |
| `CAMUNDA_WORKER_STARTUP_JITTER_MAX_SECONDS` | `startup_jitter_max_seconds`   |

**Precedence:** explicit `WorkerConfig` value > environment variable / client constructor > hardcoded default.

Example — set defaults via environment variables:

```bash
export CAMUNDA_WORKER_TIMEOUT=30000
export CAMUNDA_WORKER_MAX_CONCURRENT_JOBS=32
```

<!-- snippet-source: examples/readme.py | regions: ReadmeWorkerDefaultsEnv -->

```python
# No need to set job_timeout_milliseconds on every worker — inherited from env
client.create_job_worker(
    config=WorkerConfig(job_type="payment-service"),
    callback=handle_payment,
)
client.create_job_worker(
    config=WorkerConfig(job_type="notification-service"),
    callback=handle_notification,
)
```

Example — set defaults via client constructor:

<!-- snippet-source: examples/readme.py | regions: ReadmeWorkerDefaultsClient -->

```python
client = CamundaAsyncClient(configuration={
    "CAMUNDA_WORKER_TIMEOUT": "30000",
    "CAMUNDA_WORKER_MAX_CONCURRENT_JOBS": "16",
    "CAMUNDA_WORKER_NAME": "my-app",
})

# Both workers inherit timeout, concurrency, and name
client.create_job_worker(
    config=WorkerConfig(job_type="payment-service"),
    callback=handle_payment,
)
client.create_job_worker(
    config=WorkerConfig(job_type="shipping-service"),
    callback=handle_shipping,
)
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
