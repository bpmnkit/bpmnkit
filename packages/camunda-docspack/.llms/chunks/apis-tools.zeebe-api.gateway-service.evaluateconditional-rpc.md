# Zeebe API RPCs — `EvaluateConditional` RPC

Evaluates root-level conditional start events for process definitions.
If the evaluation is successful, it will return the keys of all created process instances, along with their associated process definition key.
Multiple root-level conditional start events of the same process definition can trigger if their conditions evaluate to true.

### Input: `EvaluateConditionalRequest`

```protobuf
message EvaluateConditionalRequest {
  // Used to evaluate root-level conditional start events for a tenant with the given ID.
  // This will only evaluate root-level conditional start events of process definitions which belong to the tenant.
  string tenantId = 1;
  // Used to evaluate root-level conditional start events of the process definition with the given key.
  optional int64 processDefinitionKey = 2;
  // Serialized JSON object representing the variables to use for evaluation of the conditions and to pass to the process instances that have been triggered.
  string variables = 3;
}
```

### Output: `EvaluateConditionalResponse`

```protobuf
message EvaluateConditionalResponse {
  // List of process instances created. If no root-level conditional start events evaluated to true, the list will be empty.
  repeated ProcessInstanceReference processInstances = 1;
  // The unique key of the conditional evaluation operation.
  int64 conditionalEvaluationKey = 2;
  // The tenant ID of the conditional evaluation operation.
  string tenantId = 3;
}

message ProcessInstanceReference {
  // The key of the process definition.
  int64 processDefinitionKey = 1;
  // The key of the created process instance.
  int64 processInstanceKey = 2;
}
```

### Errors

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- The provided data is not valid

#### GRPC_STATUS_NOT_FOUND

Returned if:

- The process definition was not found for the given processDefinitionKey

#### GRPC_STATUS_PERMISSION_DENIED

- The client is not authorized to start process instances for the specified process definition
- If a processDefinitionKey is not provided, this indicates that the client is not authorized
  to start process instances for at least one of the matched process definitions

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
