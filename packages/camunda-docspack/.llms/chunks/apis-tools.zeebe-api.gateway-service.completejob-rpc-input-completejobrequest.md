# Zeebe API RPCs — `CompleteJob` RPC — Input: `CompleteJobRequest`

```protobuf
message CompleteJobRequest {
  // the unique job identifier, as obtained from ActivateJobsResponse
  int64 jobKey = 1;
  // a JSON document representing the variables in the current task scope
  string variables = 2;
  // The result of the completed job as determined by the worker.
  // This functionality is currently supported only by user task listeners
  optional JobResult result = 3;
  // the token identifying a leased job's activation, obtained from ActivatedJob.jobLeaseToken.
  // For a leased job, the matching token must be supplied to prove the command comes from the
  // worker that holds the current lease; a command with no token is rejected. A command carrying
  // a stale token is likewise rejected, fencing the job against a superseded activation (e.g.
  // after the job timed out or failed and was re-activated by another worker). A job that was
  // activated without a lease requires no token.
  optional string jobLeaseToken = 4;
}

message JobResult{
  // Indicates whether the worker denies the work, or explicitly doesn't approve it.
  // For example, a user task listener can deny the completion of a user task by setting this flag to true.
  // In this example, the completion of a task is represented by a job that the worker can complete as denied.
  // As a result, the completion request is rejected and the task remains active.
  // Defaults to false.
  // Only applicable for user task listener jobs.
  optional bool denied = 1;
  // Attributes that were corrected by the worker.
  // The following attributes can be corrected, additional attributes will be ignored:
  //   * `assignee` - clear by providing an empty string
  //   * `dueDate` - clear by providing an empty string
  //   * `followUpDate` - clear by providing an empty string
  //   * `candidateGroups` - clear by providing an empty list
  //   * `candidateUsers` - clear by providing an empty list
  //   * `priority` - minimum 0, maximum 100, default 50
  // Omitting any of the attributes will preserve the persisted attribute's value.
  // Only applicable for user task listener jobs.
  optional JobResultCorrections corrections = 2;
  // The reason provided by the user task listener for denying the work.
  optional string deniedReason = 3;
  // Identifies the type of job result. Must be either "userTask" or "adHocSubprocess".
  // Defaults to "userTask" if not explicitly set.
  optional string type = 4;
  // The list of elements that should be activated after the job is completed.
  // Only applicable for ad-hoc subprocesses.
  repeated JobResultActivateElement activateElements = 5;
}

message JobResultCorrections {
  // The assignee of the task.
  optional string assignee = 1;
  // The due date of the task.
  optional string dueDate = 2;
  // The follow-up date of the task.
  optional string followUpDate = 3;
  // The list of candidate users of the task.
  optional StringList candidateUsers = 4;
  // The list of candidate groups of the task.
  optional StringList candidateGroups = 5;
  // The priority of the task.
  optional int32 priority = 6;
}

message JobResultActivateElement {
  // The id of the element to activate
  string elementId = 1;
  // JSON document of variables that will be created on the scope of the activated element.
  // It must be a JSON object, as variables will be mapped in a key-value fashion.
  // e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
  // "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
  // valid argument, as the root of the JSON document is an array and not an object.
  string variables = 2;
}

message StringList {
  // Wrapper around a list of string values.
  repeated string values = 1;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
