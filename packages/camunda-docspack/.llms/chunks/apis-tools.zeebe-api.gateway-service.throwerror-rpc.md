# Zeebe API RPCs — `ThrowError` RPC

`ThrowError` reports a business error (i.e. non-technical) that occurs while processing a job.

The error is handled in the process by an error catch event. If there is no error catch event with the specified `errorCode`, an incident is raised instead.

Variables can be passed along with the thrown error to provide additional details that can be used in the process.

### Input: `ThrowErrorRequest`

```protobuf
message ThrowErrorRequest {
  // the unique job identifier, as obtained when activating the job
  int64 jobKey = 1;
  // the error code that will be matched with an error catch event
  string errorCode = 2;
  // an optional error message that provides additional context
  string errorMessage = 3;
  // JSON document that will instantiate the variables at the local scope of the
  // error catch event that catches the thrown error; it must be a JSON object, as variables will be mapped in a
  // key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
  // "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
  // valid argument, as the root of the JSON document is an array and not an object.
  string variables = 4;
  // the token identifying a leased job's activation, obtained from ActivatedJob.jobLeaseToken.
  // For a leased job, the matching token must be supplied to prove the command comes from the
  // worker that holds the current lease; a command with no token is rejected. A command carrying
  // a stale token is likewise rejected, fencing the job against a superseded activation (e.g.
  // after the job timed out or failed and was re-activated by another worker). A job that was
  // activated without a lease requires no token.
  optional string jobLeaseToken = 5;
}
```

### Output: `ThrowErrorResponse`

```protobuf
message ThrowErrorResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No job was found with the given key.
- No job was found with the given key for the tenants the user is authorized to work with.

#### GRPC_STATUS_FAILED_PRECONDITION

Returned if:

- The job is already in a failed state, i.e. ran out of retries.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
