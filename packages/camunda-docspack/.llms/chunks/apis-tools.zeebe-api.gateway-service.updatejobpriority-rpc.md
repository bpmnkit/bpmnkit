# Zeebe API RPCs — `UpdateJobPriority` RPC

Updates the priority of a job.

### Input: `UpdateJobPriorityRequest`

```protobuf
message UpdateJobPriorityRequest {
  // the unique job identifier, as obtained from ActivateJobsResponse
  int64 jobKey = 1;
  // the new priority value for the job
  optional int32 priority = 2;
  // a reference key chosen by the user and will be part of all records resulted from this operation
  optional uint64 operationReference = 3;
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

### Output: `UpdateJobPriorityResponse`

```protobuf
message UpdateJobPriorityResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No job exists with the given key.
- No job was found with the given key for the tenants the user is authorized to work with.

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- Priority is not provided.

#### GRPC_STATUS_INVALID_STATE

Returned if:

- The job is in a terminal state.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
