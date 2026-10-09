# Zeebe API RPCs — `EvaluateDecision` RPC — Output: `EvaluateDecisionResponse`

```protobuf
message EvaluateDecisionResponse {
  // the unique key identifying the decision which was evaluated (e.g. returned
  // from a decision in the DeployResourceResponse message)
  int64 decisionKey = 1;
  // the ID of the decision which was evaluated
  string decisionId = 2;
  // the name of the decision which was evaluated
  string decisionName = 3;
  // the version of the decision which was evaluated
  int32 decisionVersion = 4;
  // the ID of the decision requirements graph that the decision which was
  // evaluated is part of.
  string decisionRequirementsId = 5;
  // the unique key identifying the decision requirements graph that the
  // decision which was evaluated is part of.
  int64 decisionRequirementsKey = 6;
  // JSON document that will instantiate the result of the decision which was
  // evaluated; it will be a JSON object, as the result output will be mapped
  // in a key-value fashion, e.g. { "a": 1 }.
  string decisionOutput = 7;
  // a list of decisions that were evaluated within the requested decision evaluation
  repeated EvaluatedDecision evaluatedDecisions = 8;
  // an optional string indicating the ID of the decision which
  // failed during evaluation
  string failedDecisionId = 9;
  // an optional message describing why the decision which was evaluated failed
  string failureMessage = 10;
  // the tenant identifier of the evaluated decision
  string tenantId = 11;
  // the unique key identifying this decision evaluation
  int64 decisionInstanceKey = 12;
}

message EvaluatedDecision {
  // the unique key identifying the decision which was evaluated (e.g. returned
  // from a decision in the DeployResourceResponse message)
  int64 decisionKey = 1;
  // the ID of the decision which was evaluated
  string decisionId = 2;
  // the name of the decision which was evaluated
  string decisionName = 3;
  // the version of the decision which was evaluated
  int32 decisionVersion = 4;
  // the type of the decision which was evaluated
  string decisionType = 5;
  // JSON document that will instantiate the result of the decision which was
  // evaluated; it will be a JSON object, as the result output will be mapped
  // in a key-value fashion, e.g. { "a": 1 }.
  string decisionOutput = 6;
  // the decision rules that matched within this decision evaluation
  repeated MatchedDecisionRule matchedRules = 7;
  // the decision inputs that were evaluated within this decision evaluation
  repeated EvaluatedDecisionInput evaluatedInputs = 8;
  // the tenant identifier of the evaluated decision
  string tenantId = 9;
}

message EvaluatedDecisionInput {
  // the id of the evaluated decision input
  string inputId = 1;
  // the name of the evaluated decision input
  string inputName = 2;
  // the value of the evaluated decision input
  string inputValue = 3;
}

message EvaluatedDecisionOutput {
  // the ID of the evaluated decision output
  string outputId = 1;
  // the name of the evaluated decision output
  string outputName = 2;
  // the value of the evaluated decision output
  string outputValue = 3;
}

message MatchedDecisionRule {
  // the ID of the matched rule
  string ruleId = 1;
  // the index of the matched rule
  int32 ruleIndex = 2;
  // the evaluated decision outputs
  repeated EvaluatedDecisionOutput evaluatedOutputs = 3;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
