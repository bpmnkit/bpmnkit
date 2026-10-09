# Zeebe API RPCs — `EvaluateDecision` RPC — Input: `EvaluateDecisionRequest`

```protobuf
message EvaluateDecisionRequest {
  // the unique key identifying the decision to be evaluated (e.g. returned
  // from a decision in the DeployResourceResponse message)
  int64 decisionKey = 1;
  // the ID of the decision to be evaluated
  string decisionId = 2;
  // JSON document that will instantiate the variables for the decision to be
  // evaluated; it must be a JSON object, as variables will be mapped in a
  // key-value fashion, e.g. { "a": 1, "b": 2 } will create two variables,
  // named "a" and "b" respectively, with their associated values.
  // [{ "a": 1, "b": 2 }] would not be a valid argument, as the root of the
  // JSON document is an array and not an object.
  string variables = 3;
  // the tenant identifier of the decision
  string tenantId = 4;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
