# Zeebe API RPCs — `CreateProcessInstanceWithResult` RPC

Similar to `CreateProcessInstance` RPC, creates and starts an instance of the specified process.
Unlike `CreateProcessInstance` RPC, the response is returned when the process is completed.

**Note**
Only processes with none start events can be started through this command.

**Note**
Start instructions have the same [limitations as process instance modification](https://docs.camunda.io/docs/next/components/concepts/process-instance-modification#limitations), e.g., it is not possible to start at a sequence flow.

### Input: `CreateProcessInstanceWithResultRequest`

```protobuf
message CreateProcessInstanceWithResultRequest {
  CreateProcessInstanceRequest request = 1;
  // timeout (in ms). the request will be closed if the process is not completed
  // before the requestTimeout.
  // if requestTimeout = 0, uses the generic requestTimeout configured in the gateway.
  int64 requestTimeout = 2;
  // list of names of variables to be included in `CreateProcessInstanceWithResultResponse.variables`
  // if empty, all visible variables in the root scope will be returned.
  repeated string fetchVariables = 3;
}
```

### Output: `CreateProcessInstanceWithResultResponse`

```protobuf
message CreateProcessInstanceWithResultResponse {
  // the key of the process definition which was used to create the process instance
  int64 processDefinitionKey = 1;
  // the BPMN process ID of the process definition which was used to create the process
  // instance
  string bpmnProcessId = 2;
  // the version of the process definition which was used to create the process instance
  int32 version = 3;
  // the unique identifier of the created process instance; to be used wherever a request
  // needs a process instance key (e.g. CancelProcessInstanceRequest)
  int64 processInstanceKey = 4;
  // JSON document
  // consists of visible variables in the root scope
  string variables = 5;
  // the tenant identifier of the process definition
  string tenantId = 6;
  // tags attached to a process instance
  repeated string tags = 7;
  // the business id of the created process instance
  optional string businessId = 8;
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No process with the given key exists (if processKey was given).
- No process with the given process ID exists (if bpmnProcessId was given but version was -1).
- No process with the given process ID and version exists (if both bpmnProcessId and version were given).

#### GRPC_STATUS_FAILED_PRECONDITION

Returned if:

- The process definition does not contain a none start event; only processes with none
  start event can be started manually.

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- The given variables argument is not a valid JSON document; it is expected to be a valid
  JSON document where the root node is an object.
- The given `businessId` exceeds the maximum length of 256 characters.
- If multi-tenancy is enabled, and `tenantId` is blank (empty string, null)
- If multi-tenancy is enabled, and an invalid tenant ID is provided. A tenant ID is considered invalid if:
  - The tenant ID is blank (empty string, null)
  - The tenant ID is longer than 31 characters
  - The tenant ID contains anything other than alphanumeric characters, dot (.), dash (-), or underscore (\_)
- If multi-tenancy is disabled, and `tenantId` is not blank (empty string, null), or has an ID other than `<default>`

#### GRPC_STATUS_PERMISSION_DENIED

- If multi-tenancy is enabled, and an unauthorized tenant ID is provided

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
