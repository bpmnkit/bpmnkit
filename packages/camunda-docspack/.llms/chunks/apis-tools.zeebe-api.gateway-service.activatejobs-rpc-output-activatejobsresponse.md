# Zeebe API RPCs — `ActivateJobs` RPC — Output: `ActivateJobsResponse`

```protobuf
message ActivateJobsResponse {
  // list of activated jobs
  repeated ActivatedJob jobs = 1;
}

message ActivatedJob {
  // Describes the kind of job.
  enum JobKind {
    BPMN_ELEMENT = 0;
    EXECUTION_LISTENER = 1;
    TASK_LISTENER = 2;
  }

  // Describes the listener event type of the job.
  enum ListenerEventType {
    ASSIGNING = 0;
    CANCELING = 1;
    COMPLETING = 2;
    CREATING = 3;
    END = 4;
    START = 5;
    UNSPECIFIED = 6;
    UPDATING = 7;
  }

  // the key, a unique identifier for the job
  int64 key = 1;
  // the type of the job (should match what was requested)
  string type = 2;
  // the job's process instance key
  int64 processInstanceKey = 3;
  // the bpmn process ID of the job process definition
  string bpmnProcessId = 4;
  // the version of the job process definition
  int32 processDefinitionVersion = 5;
  // the key of the job process definition
  int64 processDefinitionKey = 6;
  // the associated task element ID
  string elementId = 7;
  // the unique key identifying the associated task, unique within the scope of the
  // process instance
  int64 elementInstanceKey = 8;
  // a set of custom headers defined during modelling; returned as a serialized
  // JSON document
  string customHeaders = 9;
  // the name of the worker which activated this job
  string worker = 10;
  // the amount of retries left to this job (should always be positive)
  int32 retries = 11;
  // when the job can be activated again, sent as a UNIX epoch timestamp
  int64 deadline = 12;
  // JSON document, computed at activation time, consisting of all visible variables to
  // the task scope
  string variables = 13;
  // the ID of the tenant that owns the job
  string tenantId = 14;
  // the kind of the job.
  JobKind kind = 15;
  // the listener event type of the job.
  ListenerEventType listenerEventType = 16;
  // the lease token identifying this activation; unset when the job was activated without a
  // lease
  optional string jobLeaseToken = 21;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
