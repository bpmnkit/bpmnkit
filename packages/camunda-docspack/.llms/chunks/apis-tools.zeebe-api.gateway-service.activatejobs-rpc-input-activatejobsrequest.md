# Zeebe API RPCs — `ActivateJobs` RPC — Input: `ActivateJobsRequest`

```protobuf
message ActivateJobsRequest {
  // the job type, as defined in the BPMN process (e.g. <zeebe:taskDefinition
  // type="payment-service" />)
  string type = 1;
  // the name of the worker activating the jobs, mostly used for logging purposes
  string worker = 2;
  // a job returned after this call will not be activated by another call until the
  // timeout (in ms) has been reached
  int64 timeout = 3;
  // the maximum jobs to activate by this request
  int32 maxJobsToActivate = 4;
  // a list of variables to fetch as the job variables; if empty, all visible variables at
  // the time of activation for the scope of the job will be returned
  repeated string fetchVariable = 5;
  // The request will be completed when at least one job is activated or after the requestTimeout (in ms).
  // if the requestTimeout = 0, a default timeout is used.
  // if the requestTimeout < 0, long polling is disabled and the request is completed immediately, even when no job is activated.
  int64 requestTimeout = 6;
  // a list of IDs of tenants for which to activate jobs
  repeated string tenantIds = 7;
  // whether to activate the jobs with a lease; when true, each activated job is assigned a
  // distinct, opaque lease token, returned as ActivatedJob.jobLeaseToken. The lease fences the
  // complete, fail, and throw-error commands against a superseded activation of the same job
  // (e.g. after the job timed out or failed and was re-activated by another worker): a command
  // carrying a stale lease token is rejected rather than racing with the newer activation. Once
  // a job has been activated with a lease, it is served only to leasing workers of that job
  // type; a homogeneous fleet per job type is recommended. Defaults to false, which activates
  // jobs without a lease.
  bool withLease = 9;
}
```

If `requestTimeout` is set to `0`, the effective timeout depends on whether long polling is enabled:

- If long polling is enabled, the gateway uses its configured long-polling timeout (`camunda.api.long-polling.timeout` / `zeebe.gateway.longPolling.timeout`, default 10,000 ms).
- If long polling is disabled, the request falls back to a client-side timeout. For gRPC clients, this currently defaults to 10,000 ms.

If `requestTimeout` is set to a value less than `0`, long polling is disabled and the request completes immediately, even when no job is activated.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
