# Zeebe API RPCs — `EvaluateDecision` RPC

Evaluates a decision. You specify the decision to evaluate either by
using its unique KEY (as returned by DeployResource), or using the decision
ID. When using the decision ID, the latest deployed version of the decision
is used.

**Note**
When you specify both the decision ID and KEY, the ID is used to find the decision to be evaluated.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
