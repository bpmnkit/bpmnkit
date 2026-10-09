# Job worker — Metrics

The job worker exposes metrics through a custom interface: [JobWorkerMetrics](https://github.com/camunda/camunda/blob/main/clients/java/src/main/java/io/camunda/client/api/worker/JobWorkerMetrics.java). These represent specific callbacks used by the job worker to keep track of various internals, e.g. count of jobs activated, count of jobs handled, etc.

**Note**
By default, job workers will not track any metrics, and it's up to the caller to specify an implementation if they wish to make use of this feature.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
