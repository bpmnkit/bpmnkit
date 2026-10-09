# Zeebe API RPCs — `CancelProcessInstance` RPC

Cancels a running process instance.

### Input: `CancelProcessInstanceRequest`

```protobuf
message CancelProcessInstanceRequest {
  // the process instance key (as, for example, obtained from
  // CreateProcessInstanceResponse)
  int64 processInstanceKey = 1;
}
```

### Output: `CancelProcessInstanceResponse`

```protobuf
message CancelProcessInstanceResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No process instance exists with the given key. Note that since process instances are removed once they are finished, it could mean the instance did exist at some point.
- No process instance exists with the given key for the tenants the user is authorized to work with.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
