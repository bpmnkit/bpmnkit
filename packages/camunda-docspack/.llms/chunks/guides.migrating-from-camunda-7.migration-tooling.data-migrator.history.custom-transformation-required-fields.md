# History — Custom transformation — Required fields

Some Camunda 8 entity fields are required to be non-null. The built-in transformers always populate them, but a custom interceptor can overwrite a value with `null`. Camunda 8 enforces non-nullability when these entities are read, so a row written with a `null` in a required field may fail to be read back through the Camunda 8 APIs.

When customizing entity conversion, do not set the following required fields to `null`:

| Camunda 8 model        | Required fields                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FlowNodeInstance`     | `flowNodeInstanceKey`, `processInstanceKey`, `processDefinitionKey`, `flowNodeId`, `type`, `state`, `processDefinitionId`, `tenantId`                                                                                                                         |
| `Incident`             | `incidentKey`, `processDefinitionKey`, `processDefinitionId`, `processInstanceKey`, `errorMessage`, `flowNodeId`, `flowNodeInstanceKey`, `creationTime`, `tenantId`                                                                                           |
| `Job`                  | `jobKey`, `type`, `worker`, `state`, `kind`, `listenerEventType`, `retries`, `hasFailedWithRetriesLeft`, `processDefinitionId`, `processDefinitionKey`, `processInstanceKey`, `elementId`, `elementInstanceKey`, `tenantId`, `creationTime`, `lastUpdateTime` |
| `UserTask`             | `userTaskKey`, `elementId`, `processDefinitionId`, `creationDate`, `state`, `processDefinitionKey`, `processInstanceKey`, `elementInstanceKey`, `processDefinitionVersion`, `tenantId`                                                                        |
| `Variable`             | `variableKey`, `name`, `value`, `scopeKey`, `processInstanceKey`, `processDefinitionId`, `tenantId`                                                                                                                                                           |
| `ProcessInstance`      | `processInstanceKey`, `tenantId`                                                                                                                                                                                                                              |
| `ProcessDefinition`    | `processDefinitionKey`, `processDefinitionId`, `resourceName`, `version`, `tenantId`                                                                                                                                                                          |
| `DecisionInstance`     | `decisionInstanceId`, `decisionInstanceKey`, `state`, `evaluationDate`, `decisionDefinitionId`, `decisionDefinitionKey`, `decisionDefinitionName`, `decisionDefinitionType`, `result`, `tenantId`                                                             |
| `DecisionDefinition`   | `decisionDefinitionKey`, `decisionDefinitionId`, `name`, `version`, `decisionRequirementsId`, `decisionRequirementsKey`, `decisionRequirementsVersion`, `tenantId`                                                                                            |
| `DecisionRequirements` | `decisionRequirementsKey`, `decisionRequirementsId`, `name`, `version`, `resourceName`, `tenantId`                                                                                                                                                            |
| `Form`                 | `formKey`, `formId`, `schema`, `version`, `tenantId`                                                                                                                                                                                                          |
| `AuditLog`             | `auditLogKey`, `entityKey`, `entityType`, `operationType`, `timestamp`, `result`, `category`                                                                                                                                                                  |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
