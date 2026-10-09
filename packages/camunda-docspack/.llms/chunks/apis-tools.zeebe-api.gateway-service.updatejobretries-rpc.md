# Zeebe API RPCs — `UpdateJobRetries` RPC

Updates the number of retries a job has left. This is mostly useful for jobs that have run out of
retries, should the underlying problem be solved.

### Input: `UpdateJobRetriesRequest`

```protobuf
message UpdateJobRetriesRequest {
  // the unique job identifier, as obtained through ActivateJobs
  int64 jobKey = 1;
  // the new amount of retries for the job; must be positive
  int32 retries = 2;
  // the token identifying a leased job's activation, obtained from ActivatedJob.jobLeaseToken.
  // For a leased job, a supplied token is validated to prove the command comes from the worker
  // that holds the current lease; a command carrying a stale token is rejected, fencing the job
  // against a superseded activation (e.g. after the job timed out or failed and was re-activated
  // by another worker). An update without a token always applies, to support operator and bulk
  // updates of leased jobs; this differs from lifecycle commands like complete, fail, and
  // throw-error, which always require a token for leased jobs. A job that was activated without a
  // lease requires no token.
  optional string jobLeaseToken = 4;
}
```

### Output: `UpdateJobRetriesResponse`

```protobuf
message UpdateJobRetriesResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No job exists with the given key.
- No job was found with the given key for the tenants the user is authorized to work with.

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- Retries is not greater than 0.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
