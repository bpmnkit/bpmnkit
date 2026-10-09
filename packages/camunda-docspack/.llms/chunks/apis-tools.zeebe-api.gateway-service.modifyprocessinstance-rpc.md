# Zeebe API RPCs — `ModifyProcessInstance` RPC

Modifies a running process instance. The command can contain multiple instructions to activate an element of the
process, or to terminate an active instance of an element.

Use the command to repair a process instance that is stuck on an element or took an unintended path. For example,
because an external system is not available or doesn't respond as expected.

### Input: `ModifyProcessInstanceRequest`

```protobuf
message ModifyProcessInstanceRequest {
  // the key of the process instance that should be modified
  int64 processInstanceKey = 1;
  // instructions describing which elements should be activated in which scopes,
  // and which variables should be created
  repeated ActivateInstruction activateInstructions = 2;
  // instructions describing which elements should be terminated
  repeated TerminateInstruction terminateInstructions = 3;

  message ActivateInstruction {
    // the ID of the element that should be activated
    string elementId = 1;
    // the key of the ancestor scope the element instance should be created in;
    // set to -1 to create the new element instance within an existing element
    // instance of the flow scope
    int64 ancestorElementInstanceKey = 2;
    // instructions describing which variables should be created
    repeated VariableInstruction variableInstructions = 3;
  }

  message VariableInstruction {
    // JSON document that will instantiate the variables for the root variable scope of the
    // process instance; it must be a JSON object, as variables will be mapped in a
    // key-value fashion. e.g. { "a": 1, "b": 2 } will create two variables, named "a" and
    // "b" respectively, with their associated values. [{ "a": 1, "b": 2 }] would not be a
    // valid argument, as the root of the JSON document is an array and not an object.
    string variables = 1;
    // the ID of the element in which scope the variables should be created;
    // leave empty to create the variables in the global scope of the process instance
    string scopeId = 2;
  }

  message TerminateInstruction {
    // the ID of the element that should be terminated
    int64 elementInstanceKey = 1;
  }
}
```

### Output: `ModifyProcessInstanceResponse`

```protobuf
message ModifyProcessInstanceResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No process instance exists with the given key, or it is not active.
- No process instance was found with the given key for the tenants the user is authorized to work with.

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- At least one activate instruction is invalid. An activate instruction is considered invalid if:
  - The process doesn't contain an element with the given ID.
  - A flow scope of the given element can't be created.
  - The given element has more than one active instance of its flow scope.
- At least one variable instruction is invalid. A variable instruction is considered invalid if:
  - The process doesn't contain an element with the given scope ID.
  - The given element doesn't belong to the activating element's flow scope.
  - The given variables are not a valid JSON document.
- At least one terminate instruction is invalid. A terminate instruction is considered invalid if:
  - No element instance exists with the given key, or it is not active.
- The instructions would terminate all element instances of a process instance that was created by a call activity in
  the parent process.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
