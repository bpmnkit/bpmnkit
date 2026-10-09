# Zeebe API RPCs — `DeployResource` RPC — Output: `DeployResourceResponse`

```protobuf
message DeployResourceResponse {
  // the unique key identifying the deployment
  int64 key = 1;
  // a list of deployed resources, e.g. processes
  repeated Deployment deployments = 2;
  // the tenant id of the deployed resources
  string tenantId = 3;
}

message Deployment {
  // each deployment has only one metadata
  oneof Metadata {
    // metadata of a deployed process
    ProcessMetadata process = 1;
    // metadata of a deployed decision
    DecisionMetadata decision = 2;
    // metadata of a deployed decision requirements
    DecisionRequirementsMetadata decisionRequirements = 3;
    // metadata of a deployed form
    FormMetadata form = 4;
  }
}

message ProcessMetadata {
  // the bpmn process ID, as parsed during deployment; together with the version forms a
  // unique identifier for a specific process definition
  string bpmnProcessId = 1;
  // the assigned process version
  int32 version = 2;
  // the assigned key, which acts as a unique identifier for this process
  int64 processDefinitionKey = 3;
  // the resource name (see: ProcessRequestObject.name) from which this process was
  // parsed
  string resourceName = 4;
  // the tenant id of the deployed process
  string tenantId = 5;
}

message DecisionMetadata {
  // the dmn decision ID, as parsed during deployment; together with the
  // versions forms a unique identifier for a specific decision
  string dmnDecisionId = 1;
  // the dmn name of the decision, as parsed during deployment
  string dmnDecisionName = 2;
  // the assigned decision version
  int32 version = 3;
  // the assigned decision key, which acts as a unique identifier for this
  // decision
  int64 decisionKey = 4;
  // the dmn ID of the decision requirements graph that this decision is part
  // of, as parsed during deployment
  string dmnDecisionRequirementsId = 5;
  // the assigned key of the decision requirements graph that this decision is
  // part of
  int64 decisionRequirementsKey = 6;
  // the tenant id of the deployed decision
  string tenantId = 7;
}

message DecisionRequirementsMetadata {
  // the dmn decision requirements ID, as parsed during deployment; together
  // with the versions forms a unique identifier for a specific decision
  string dmnDecisionRequirementsId = 1;
  // the dmn name of the decision requirements, as parsed during deployment
  string dmnDecisionRequirementsName = 2;
  // the assigned decision requirements version
  int32 version = 3;
  // the assigned decision requirements key, which acts as a unique identifier
  // for this decision requirements
  int64 decisionRequirementsKey = 4;
  // the resource name (see: Resource.name) from which this decision
  // requirements was parsed
  string resourceName = 5;
  // the tenant id of the deployed decision requirements
  string tenantId = 6;
}

message FormMetadata {
  // the form ID, as parsed during deployment; together with the
  // versions forms a unique identifier for a specific form
  string formId = 1;
  // the assigned form version
  int32 version = 2;
  // the assigned key, which acts as a unique identifier for this form
  int64 formKey = 3;
  // the resource name
  string resourceName = 4;
  // the tenant id of the deployed form
  string tenantId = 5;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
