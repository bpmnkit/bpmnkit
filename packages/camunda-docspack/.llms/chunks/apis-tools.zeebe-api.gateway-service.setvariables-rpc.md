# Zeebe API RPCs — `SetVariables` RPC

Updates all the variables of a particular scope (e.g. process instance, flow element instance) from the given JSON document.

### Input: `SetVariablesRequest`

```protobuf
message SetVariablesRequest {
  // the unique identifier of a particular element; can be the process instance key (as
  // obtained during instance creation), or a given element, such as a service task (see
  // elementInstanceKey on the job message)
  int64 elementInstanceKey = 1;
  // a JSON serialized document describing variables as key value pairs; the root of the document
  // must be an object
  string variables = 2;
  // if true, the variables will be merged strictly into the local scope (as indicated by
  // elementInstanceKey); this means the variables is not propagated to upper scopes.
  // for example, let's say we have two scopes, '1' and '2', with each having effective variables as:
  // 1 => `{ "foo" : 2 }`, and 2 => `{ "bar" : 1 }`. if we send an update request with
  // elementInstanceKey = 2, variables `{ "foo" : 5 }`, and local is true, then scope 1 will
  // be unchanged, and scope 2 will now be `{ "bar" : 1, "foo" 5 }`. if local was false, however,
  // then scope 1 would be `{ "foo": 5 }`, and scope 2 would be `{ "bar" : 1 }`.
  bool local = 3;
}
```

### Output: `SetVariablesResponse`

```protobuf
message SetVariablesResponse {
  // the unique key of the set variables command
  int64 key = 1;
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No element with the given `elementInstanceKey` exists.
- No element with the given `elementInstanceKey` was found for the tenants the user is authorized to work with.

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- The given payload is not a valid JSON document; all payloads are expected to be
  valid JSON documents where the root node is an object.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
