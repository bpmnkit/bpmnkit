# Zeebe API RPCs — `BroadcastSignal` RPC

Broadcasts a [signal](https://docs.camunda.io/docs/next/components/concepts/signals).

### Input: `BroadcastSignalRequest`

```protobuf
message BroadcastSignalRequest {
  // The name of the signal
  string signalName = 1;
  // the signal variables as a JSON document; to be valid, the root of the document must be an
  // object, e.g. { "a": "foo" }. [ "foo" ] would not be valid.
  string variables = 2;
  // the ID of the tenant that owns the signal.
  string tenantId = 3;
}
```

### Output: `BroadcastSignalResponse`

```protobuf
message BroadcastSignalResponse {
  // the unique ID of the signal that was broadcasted.
  int64 key = 1;
  // the tenant ID of the signal that was broadcasted.
  string tenantId = 2;
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

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
