# Zeebe API RPCs — `FailJob` RPC

Marks the job as failed. If the retries argument is positive and no retry back off is set, the job is immediately
activatable again. If the retry back off is positive the job becomes activatable once the back off timeout has passed.
If the retries argument is zero or negative, an incident is raised, tagged with the given errorMessage, and the job is
not activatable until the incident is resolved. If the variables argument is set, the variables are merged into the process at the local scope of the job's associated task.

### Input: `FailJobRequest`

```protobuf
message FailJobRequest {
  // the unique job identifier, as obtained when activating the job
  int64 jobKey = 1;
  // the amount of retries the job should have left
  int32 retries = 2;
  // an optional message describing why the job failed
  // this is particularly useful if a job runs out of retries and an incident is raised,
  // as it this message can help explain why an incident was raised
  string errorMessage = 3;
  // the backoff timeout (in ms) for the next retry
  int64 retryBackOff = 4;
  // JSON document that will instantiate the variables at the local scope of the
  // job's associated task; it must be a JSON object, as variables will be mapped in a
  // key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
  // "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
  // valid argument, as the root of the JSON document is an array and not an object.
  string variables = 5;
  // the token identifying a leased job's activation, obtained from ActivatedJob.jobLeaseToken.
  // For a leased job, the matching token must be supplied to prove the command comes from the
  // worker that holds the current lease; a command with no token is rejected. A command carrying
  // a stale token is likewise rejected, fencing the job against a superseded activation (e.g.
  // after the job timed out or failed and was re-activated by another worker). A job that was
  // activated without a lease requires no token.
  optional string jobLeaseToken = 6;
}
```

### Output: `FailJobResponse`

```protobuf
message FailJobResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No job was found with the given key.
- No job was found with the given key for the tenants the user is authorized to work with.

#### GRPC_STATUS_FAILED_PRECONDITION

Returned if:

- The job was not activated.
- The job is already in a failed state, i.e. ran out of retries.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
