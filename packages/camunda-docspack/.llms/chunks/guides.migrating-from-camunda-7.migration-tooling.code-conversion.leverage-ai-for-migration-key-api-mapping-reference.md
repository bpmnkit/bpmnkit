# Code Conversion — Leverage AI for migration — Key API mapping reference

These tables summarize common mappings between Camunda 7 and Camunda 8. Use them to understand and review migration output.

#### Type mappings

| Camunda 7                                      | Camunda 8                                         |
| ---------------------------------------------- | ------------------------------------------------- |
| `ProcessEngine`                                | `CamundaClient`                                   |
| `RuntimeService`                               | `CamundaClient` (methods directly on client)      |
| `TaskService`                                  | `CamundaClient` (user task methods)               |
| `RepositoryService`                            | `CamundaClient` (deployment/definition methods)   |
| `ProcessInstance`                              | `ProcessInstanceEvent`                            |
| `Task`                                         | `UserTask`                                        |
| `Deployment`                                   | `DeploymentEvent`                                 |
| `Batch`                                        | No direct equivalent (single instance operations) |
| `VariableMap`                                  | `Map<String, Object>`                             |
| `TypedValue` (IntegerValue, StringValue, etc.) | Plain Java types                                  |
| `DelegateExecution`                            | `ActivatedJob`                                    |
| `ExternalTask` + `ExternalTaskService`         | `JobClient` + `ActivatedJob`                      |
| `BpmnError`                                    | `CamundaError.bpmnError(...)`                     |
| `ProcessEngineException`                       | `CamundaError.jobError(...)`                      |

#### Parameter name changes

**Important**
The terms `processDefinitionKey` and `processDefinitionId` have **swapped meanings** between Camunda 7 and Camunda 8. Review these carefully during migration.

| Description                      | Camunda 7                  | Camunda 8                               |
| -------------------------------- | -------------------------- | --------------------------------------- |
| BPMN model identifier (from XML) | `processDefinitionKey`     | `bpmnProcessId` / `processDefinitionId` |
| Unique key from deployment       | `processDefinitionId`      | `processDefinitionKey`                  |
| Process instance identifier      | `String processInstanceId` | `Long processInstanceKey`               |

#### Test assertion mappings

| Camunda 7 (BpmnAwareTests)                      | Camunda 8 (CamundaAssert)                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `assertThat(pi).isNotEnded()`                   | `assertThat(pi).isActive()`                                                             |
| `assertThat(pi).isEnded()`                      | `assertThat(pi).isCompleted()`                                                          |
| `assertThat(pi).isWaitingAt("id")`              | `assertThat(pi).hasActiveElements("id")`                                                |
| `assertThat(pi).isWaitingAt(findId("name"))`    | `assertThat(pi).hasActiveElements(byName("name"))`                                      |
| `assertThat(pi).hasPassed("id")`                | `assertThat(pi).hasCompletedElements("id")`                                             |
| `assertThat(pi).variables().containsEntry(k,v)` | `assertThat(pi).hasVariable(k, v)`                                                      |
| `assertThat(task()).hasName("x")`               | `assertThat(UserTaskSelectors.byTaskName("x")).hasName("x")`                            |
| `assertThat(task()).isAssignedTo("u")`          | `assertThat(UserTaskSelectors.byTaskName("x")).hasAssignee("u")`                        |
| `complete(task())`                              | `processTestContext.completeUserTask("name")`                                           |
| `managementService().executeJob(id)`            | `processTestContext.increaseTime(Duration)` or `processTestContext.completeJob("type")` |

#### Import replacements

| Remove                                                                    | Add                                                              |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `org.camunda.bpm.engine.*`                                                | `io.camunda.client.*`                                            |
| `org.camunda.bpm.engine.delegate.*`                                       | `io.camunda.client.api.worker.JobHandler`                        |
| `org.camunda.bpm.engine.variable.*`                                       | (plain Java collections)                                         |
| `org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.*`            | `io.camunda.process.test.api.CamundaAssert.*`                    |
| N/A                                                                       | `io.camunda.process.test.api.assertions.ElementSelectors.byName` |
| N/A                                                                       | `io.camunda.process.test.api.assertions.UserTaskSelectors`       |
| N/A                                                                       | `io.camunda.process.test.api.CamundaProcessTestContext`          |
| N/A                                                                       | `io.camunda.process.test.api.CamundaSpringProcessTest`           |
| `org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication` | `io.camunda.client.annotation.Deployment`                        |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
