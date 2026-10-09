# Migrate from gRPC to the Orchestration Cluster API — Camunda Java Client

In version 8.8.0, the [Camunda Java Client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) changes to use the Orchestration Cluster API as a default cluster communication method.

**Info**
Refer to the [Camunda Java Client migration guide](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client#protocol-and-connection-rest-vs-grpc-selection) for details on how you can continue using gRPC.


## gRPC vs REST mapping reference

The following table provides a mapping reference between gRPC methods and their equivalent REST API endpoints in the Orchestration Cluster API.

**Info**
For detailed information on each REST endpoint, see [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

| gRPC Method Name (Gateway.proto)  | Orchestration Cluster REST API Endpoint                        | Notes                                                                    |
| --------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ActivateJobs`                    | `POST /v2/jobs/activation`                                     | Batch job activation via long polling (streaming not available in REST). |
| `BroadcastSignal`                 | `POST /v2/signals/broadcast`                                   | Triggers signal events.                                                  |
| `CancelProcessInstance`           | `POST /v2/process-instances/{processInstanceKey}/cancellation` | Cancels a process instance.                                              |
| `CompleteJob`                     | `POST /v2/jobs/{jobKey}/completion`                            | Completes a job.                                                         |
| `CreateProcessInstance`           | `POST /v2/process-instances`                                   | Starts a new process instance.                                           |
| `CreateProcessInstanceWithResult` | `POST /v2/process-instances?awaitCompletion=true`              | Starts a process instance, waits for completion.                         |
| `DeleteResource`                  | `POST /v2/resources/{resourceKey}/deletion`                    | Deletes a resource.                                                      |
| `DeployResource`                  | `POST /v2/deployments`                                         | Deploys BPMN, DMN, or form resources (multipart upload).                 |
| `EvaluateDecision`                | `POST /v2/decisions/evaluation`                                | Evaluates a DMN decision by key or id.                                   |
| `FailJob`                         | `POST /v2/jobs/{jobKey}/failure`                               | Marks a job as failed.                                                   |
| `MigrateProcessInstance`          | `POST /v2/process-instances/{processInstanceKey}/migration`    | Migrates a process instance (phase 1 only).                              |
| `ModifyProcessInstance`           | `POST /v2/process-instances/{processInstanceKey}/modification` | Modifies a running process instance.                                     |
| `PublishMessage`                  | `POST /v2/messages/publication`                                | Publishes a message asynchronously.                                      |
| `ResolveIncident`                 | `POST /v2/incidents/{incidentKey}/resolution`                  | Resolves an incident.                                                    |
| `SetVariables`                    | `PUT /v2/element-instances/{elementInstanceKey}/variables`     | Sets variables (local/global by param).                                  |
| `ThrowError`                      | `POST /v2/jobs/{jobKey}/error`                                 | Throws BPMN error from worker to engine.                                 |
| `Topology`                        | `GET /v2/topology`                                             | Returns cluster info.                                                    |
| `UpdateJobRetries`                | `PATCH /v2/jobs/{jobKey}`                                      | Updates job retries, PATCH can update multiple job properties.           |
| `UpdateJobTimeout`                | `PATCH /v2/jobs/{jobKey}`                                      | Updates job timeout, PATCH can update multiple job properties.           |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-grpc-to-orchestration-cluster-api
