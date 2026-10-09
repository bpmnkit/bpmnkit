# Zeebe API RPCs — `PublishMessage` RPC

Publishes a single message. Messages are published to specific partitions computed from their
correlation keys.

### Input: `PublishMessageRequest`

```protobuf
message PublishMessageRequest {
  // the name of the message
  string name = 1;
  // the correlation key of the message
  string correlationKey = 2;
  // how long the message should be buffered on the broker, in milliseconds
  int64 timeToLive = 3;
  // the unique ID of the message; can be omitted. only useful to ensure only one message
  // with the given ID will ever be published (during its lifetime)
  string messageId = 4;
  // the message variables as a JSON document; to be valid, the root of the document must be an
  // object, e.g. { "a": "foo" }. [ "foo" ] would not be valid.
  string variables = 5;
  // the tenant id of the message
  string tenantId = 6;
}
```

### Output: `PublishMessageResponse`

```protobuf
message PublishMessageResponse {
  // the unique ID of the message that was published
  int64 key = 1;
  // the tenant id of the message
  string tenantId = 2;
}
```

### Errors

#### GRPC_STATUS_ALREADY_EXISTS

Returned if:

- A message with the same ID was previously published (and is still alive).

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
