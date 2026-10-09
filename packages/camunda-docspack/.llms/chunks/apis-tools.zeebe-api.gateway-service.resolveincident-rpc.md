# Zeebe API RPCs — `ResolveIncident` RPC

Resolves a given incident. This simply marks the incident as resolved; most likely a call to
UpdateJobRetries or SetVariables will be necessary to actually resolve the
problem, followed by this call.

### Input: `ResolveIncidentRequest`

```protobuf
message ResolveIncidentRequest {
  // the unique ID of the incident to resolve
  int64 incidentKey = 1;
}
```

### Output: `ResolveIncidentResponse`

```protobuf
message ResolveIncidentResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No incident with the given key exists.
- No incident with the given key was found for the tenants the user is authorized to work with.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
