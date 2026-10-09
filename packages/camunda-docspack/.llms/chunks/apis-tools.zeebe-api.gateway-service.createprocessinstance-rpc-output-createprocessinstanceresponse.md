# Zeebe API RPCs — `CreateProcessInstance` RPC — Output: `CreateProcessInstanceResponse`

```protobuf
message CreateProcessInstanceResponse {
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
  // the tenant identifier of the created process instance
  string tenantId = 5;
  // tags attached to a process instance
  repeated string tags = 6;
  // the business id of the created process instance
  optional string businessId = 7;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
