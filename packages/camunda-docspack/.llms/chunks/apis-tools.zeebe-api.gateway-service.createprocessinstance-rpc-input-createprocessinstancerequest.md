# Zeebe API RPCs — `CreateProcessInstance` RPC — Input: `CreateProcessInstanceRequest`

```protobuf
message CreateProcessInstanceRequest {
  // the unique key identifying the process definition (e.g. returned from a process
  // in the DeployProcessResponse message)
  int64 processDefinitionKey = 1;
  // the BPMN process ID of the process definition
  string bpmnProcessId = 2;
  // the version of the process; set to -1 to use the latest version
  int32 version = 3;
  // JSON document that will instantiate the variables for the root variable scope of the
  // process instance; it must be a JSON object, as variables will be mapped in a
  // key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
  // "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
  // valid argument, as the root of the JSON document is an array and not an object.
  string variables = 4;
  // List of start instructions. If empty (default) the process instance
  // will start at the start event. If non-empty the process instance will apply start
  // instructions after it has been created
  repeated ProcessInstanceCreationStartInstruction startInstructions = 5;

  // the tenant id of the process definition
  string tenantId = 6;

  // a reference key chosen by the user and will be part of all records resulted from this operation
  optional uint64 operationReference = 7;

  // a list of runtime instruction that can modify the behavior of the process
  // instance during its execution
  // if empty (default), the process instance will be executed normally
  repeated ProcessInstanceCreationRuntimeInstruction runtimeInstructions = 8;

  // a list of tags that can be attached as meta-data to process instances
  repeated string tags = 9;

  // an optional, user-defined string identifier that identifies the process instance
  // within the scope of the process definition (scoped by tenant). If provided and uniqueness
  // enforcement is enabled, the engine will reject creation if another root process instance
  // with the same business id is already active for the same process definition.
  // Note that any active child process instances with the same business id are not taken into account.
  optional string businessId = 10;
}

message ProcessInstanceCreationStartInstruction {

  // future extensions might include
  // - different types of start instructions
  // - ability to set local variables for different flow scopes

  // for now, however, the start instruction is implicitly a
  // "startBeforeElement" instruction

  // element ID
  string elementId = 1;
}

message ProcessInstanceCreationRuntimeInstruction {
  oneof instruction {
    TerminateProcessInstanceInstruction terminate = 1;
  }
}

message TerminateProcessInstanceInstruction {
  // the ID of the process element after which the process instance should be
  // terminated
  string afterElementId = 1;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
