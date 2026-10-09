# Job worker — Backoff configuration

When a poll fails with an error response, the job worker applies a backoff strategy. It waits for some time, after which it polls again for more jobs. This gives a Zeebe cluster some time to recover from a failure. In some cases, you may want to configure this backoff strategy to better fit your situation.

The retry delay (i.e. the time the job worker waits after an error before the next poll for new jobs) is provided by the [`BackoffSupplier`](https://github.com/camunda/camunda/blob/main/clients/java/src/main/java/io/camunda/client/api/worker/BackoffSupplier.java). You can replace it using the `.backoffSupplier()` method on the [`JobWorkerBuilder`](https://github.com/camunda/camunda/blob/main/clients/java/src/main/java/io/camunda/client/api/worker/JobWorkerBuilderStep1.java).

By default, the job worker uses an exponential backoff implementation, which you can configure using `BackoffSupplier.newBackoffBuilder()`.

The backoff strategy is especially useful for dealing with the `GRPC_STATUS_RESOURCE_EXHAUSTED` error response (refer to [gRPC Technical Error Handling](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/technical-error-handling)).

This error code indicates the Zeebe cluster is currently under too large of a load and has decided to reject this request.

By backing off, the job worker helps Zeebe by reducing the load.

**Note**
Zeebe's [backpressure mechanism](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure) can also be configured.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
