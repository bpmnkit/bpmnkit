# TypeScript SDK — Use the SDK — Create a service worker

Outside the main function, add the following code:

```typescript
console.log("Starting worker...");
const worker = camunda.createJobWorker({
  jobType: "service-task",
  workerName: "test-worker",
  maxParallelJobs: 20,
  pollIntervalMs: 1000,
  pollTimeoutMs: 50_000,
  jobTimeoutMs: 5000,
  jobHandler: (job) => {
    console.log(
      `[worker]: Completing job ${job.jobKey} from process ${job.processInstanceKey}\n`
    );
    return job.complete({
      serviceTaskOutcome: "We did it!",
    });
  },
});
```

This code starts a service task worker that runs in an asynchronous loop and invokes `jobHandler` when a job of type `service-task` becomes available.

The handler must return a job completion function such as `fail`, `complete`, `error`, or `ignore`. The type system enforces this to ensure every code path responds to Zeebe after taking a job. The `job.complete` function can take an object with variables to update.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
