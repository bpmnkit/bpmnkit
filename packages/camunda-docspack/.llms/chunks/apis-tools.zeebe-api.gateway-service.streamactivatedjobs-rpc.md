# Zeebe API RPCs — `StreamActivatedJobs` RPC

Opens a long living stream for the given job type, worker name, job timeout, and fetch variables. This will cause available
jobs in the engine to be activated and pushed down this stream.

See the [job worker's technical reference](https://docs.camunda.io/docs/next/components/concepts/job-workers) for more on this.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
