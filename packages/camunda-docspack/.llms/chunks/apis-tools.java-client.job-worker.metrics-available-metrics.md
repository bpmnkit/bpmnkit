# Job worker — Metrics — Available metrics

The API currently supports two metrics: the count of jobs activated, and the count of jobs handled.

- **The count of jobs activated** is incremented every time a worker activates new jobs. This is done by calling `JobWorkerMetrics#jobActivated(int)`, with the first argument being the count of jobs newly activated. The method is called before the job is passed to the job handler.
- **The count of jobs handled** is incremented every time a worker's `JobHandler` (passed to the builder via `JobWorkerBuilderStep2#handler(JobHandler)`) returns (regardless of whether it was successful). This is done by calling `JobWorkerMetrics#jobHandled(int)`, with the first argument being the count of jobs newly handled.

For both counters, the expectation is that implementations will simply increment an underlying counter, and track the rate or increase of this counter to derive the speed at which jobs are activated/handled by a given worker.

Additionally, by subtracting both counters, you can derive the count of queued or buffered jobs - jobs which have yet to be handled by the worker. This can help you tune your workers, e.g. scaling in or out, tuning the amount of jobs activated, etc.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
