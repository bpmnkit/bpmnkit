# Zeebe API RPCs — `DeployResource` RPC — Input: `DeployResourceRequest`

```protobuf
message DeployResourceRequest {
  // list of resources to deploy
  repeated Resource resources = 1;
  // the tenant id of the resources to deploy
  string tenantId = 2;
}

message Resource {
  // the resource name, e.g. myProcess.bpmn or myDecision.dmn
  string name = 1;
  // the file content as a UTF8-encoded string
  bytes content = 2;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
