# Zeebe API RPCs — `DeleteResource` RPC

Deletes a resource (a process definition, decision requirements definition, or form) identified by its key.

Deleting a process definition that still has running instances no longer fails. The definition starts draining: new instances are blocked immediately, running instances continue to completion, and the definition is removed automatically once its last instance finishes. See [resource deletion](https://docs.camunda.io/docs/next/components/concepts/resource-deletion#draining).

### Input `DeleteResourceRequest`

```protobuf
message DeleteResourceRequest {
  // The key of the resource that should be deleted. This can either be the key
  // of a process definition, the key of a decision requirements definition or the key of a form.
  int64 resourceKey = 1;
}
```

### Output: `DeleteResourceResponse`

```protobuf
message DeleteResourceResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No resource exists with the given key.
- No resource was found with the given key for the tenants the user is authorized to work with.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
