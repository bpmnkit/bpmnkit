# History — Entity transformation

Entity transformations are handled by built-in interceptors that transform Camunda 7 historic entities
into Camunda 8 database models during migration. The History Data Migrator uses the
`EntityInterceptor` interface to allow customization of this conversion process.

### Built-in interceptors

The following built-in transformers convert Camunda 7 historic entities:

| Interceptor                                 | Camunda 7 entity type                    | Camunda 8 Model               |
| ------------------------------------------- | ---------------------------------------- | ----------------------------- |
| `AuditLogTransformer`                       | `UserOperationLogEntry`                  | `AuditLogDbModel`             |
| `FormTransformer`                           | `CamundaFormDefinitionEntity`            | `FormDbModel`                 |
| `ProcessInstanceTransformer`                | `HistoricProcessInstance`                | `ProcessInstanceDbModel`      |
| `ProcessDefinitionTransformer`              | `ProcessDefinition`                      | `ProcessDefinitionDbModel`    |
| `FlowNodeTransformer`                       | `HistoricActivityInstance`               | `FlowNodeInstanceDbModel`     |
| `UserTaskTransformer`                       | `HistoricTaskInstance`                   | `UserTaskDbModel`             |
| `JobTransformer`                            | `HistoricJobLog`                         | `JobDbModel`                  |
| `IncidentTransformer`                       | `HistoricIncident`                       | `IncidentDbModel`             |
| `VariableTransformer`                       | `HistoricVariableInstance`               | `VariableDbModel`             |
| `DecisionInstanceTransformer`               | `HistoricDecisionInstance`               | `DecisionInstanceDbModel`     |
| `DecisionDefinitionTransformer`             | `HistoricDecisionDefinition`             | `DecisionDefinitionDbModel`   |
| `DecisionRequirementsDefinitionTransformer` | `HistoricDecisionRequirementsDefinition` | `DecisionRequirementsDbModel` |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
