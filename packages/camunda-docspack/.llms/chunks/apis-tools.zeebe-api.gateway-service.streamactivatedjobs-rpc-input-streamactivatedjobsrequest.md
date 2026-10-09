# Zeebe API RPCs — `StreamActivatedJobs` RPC — Input `StreamActivatedJobsRequest`

```protobuf
message StreamActivatedJobsRequest {
  // the job type, as defined in the BPMN process (e.g. <zeebe:taskDefinition
  // type="payment-service" />)
  string type = 1;
  // the name of the worker activating the jobs, mostly used for logging purposes
  string worker = 2;
  // a job returned after this call will not be activated by another call until the
  // timeout (in ms) has been reached
  int64 timeout = 3;
  // a list of variables to fetch as the job variables; if empty, all visible variables at
  // the time of activation for the scope of the job will be returned
  repeated string fetchVariable = 5;
  // a list of identifiers of tenants for which to stream jobs
  repeated string tenantIds = 6;
  // whether to stream jobs with a lease; when true, each job pushed on this stream is
  // assigned a distinct, opaque lease token, returned as ActivatedJob.jobLeaseToken. The lease
  // fences the complete, fail, and throw-error commands against a superseded activation of
  // the same job (e.g. after the job timed out or failed and was re-activated by another
  // worker): a command carrying a stale lease token is rejected rather than racing with the
  // newer activation. Defaults to false, which pushes jobs without a lease.
  bool withLease = 8;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
