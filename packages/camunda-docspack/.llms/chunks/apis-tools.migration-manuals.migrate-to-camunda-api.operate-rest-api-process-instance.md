# Migrate to the Orchestration Cluster API — Operate REST API — Process instance

#### Search process instances

V1
V2

POST `/v1/process-instances/search`

POST [`/v2/process-instances/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-process-instances.api)

Request structure changes as outlined in [general changes][].

| **Field**                   | **Change Type** | **Notes**                                                    |
| --------------------------- | --------------- | ------------------------------------------------------------ |
| `searchAfter`               | Renamed         | Now `after` in the `page` object.                            |
| `size`                      | Renamed         | Now `limit` in the `page` object.                            |
| `key`                       | Renamed         | Now `processInstanceKey` (changed from `int64` to `string`). |
| `processVersion`            | Renamed         | Now `processDefinitionVersion`.                              |
| `processVersionTag`         | Renamed         | Now `processDefinitionVersionTag`.                           |
| `bpmnProcessId`             | Renamed         | Now `processDefinitionId`.                                   |
| `parentFlowNodeInstanceKey` | Renamed         | Now `parentElementInstanceKey` (changed to `string`).        |
| `parentKey`                 | Renamed         | Now `parentProcessInstanceKey` (changed to `string`).        |
| `state`                     | Changed         | Use `TERMINATED` instead of `CANCELED`.                      |
| `incident`                  | Renamed         | Now `hasIncident`.                                           |
| `parentProcessInstanceKey`  | Changed         | Now `string` type instead of `int64`.                        |
| `processDefinitionKey`      | Changed         | Now `string` type instead of `int64`.                        |

Response structure changes as outlined in [general changes][].

| **Field**                   | **Change Type** | **Notes**                                                    |
| --------------------------- | --------------- | ------------------------------------------------------------ |
| `total`                     | Moved           | Now `totalItems` in `page` object.                           |
| `sortValues`                | Replaced        | Now use `endCursor` in `page` object.                        |
| `key`                       | Renamed         | Now `processInstanceKey` (changed from `int64` to `string`). |
| `processVersion`            | Renamed         | Now `processDefinitionVersion`.                              |
| `processVersionTag`         | Renamed         | Now `processDefinitionVersionTag`.                           |
| `bpmnProcessId`             | Renamed         | Now `processDefinitionId`.                                   |
| `parentFlowNodeInstanceKey` | Renamed         | Now `parentElementInstanceKey` (changed to `string`).        |
| `parentKey`                 | Renamed         | Now `parentProcessInstanceKey` (changed to `string`).        |
| `state`                     | Changed         | Use `TERMINATED` instead of `CANCELED`.                      |
| `incident`                  | Renamed         | Now `hasIncident`.                                           |
| `parentProcessInstanceKey`  | Changed         | Now `string` type instead of `int64`.                        |
| `processDefinitionKey`      | Changed         | Now `string` type instead of `int64`.                        |

#### Get process instance by key

V1
V2

GET `/v1/process-instances/{key}`

GET [`/v2/process-instances/{processInstanceKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-instance.api)

- No input adjustments.

- Except for the response structure changes, all adjustments from [search process instances](#search-process-instances) apply.

#### Delete process instance and all dependant data by key

V1
V2

DELETE `/v1/process-instances/{key}`

This feature is not yet available in V2. It will be added in a future version.

#### Get flow node statistic by process instance key

V1
V2

GET `/v1/process-instances/{key}/statistics`

GET [`/v2/process-instances/{processInstanceKey}/statistics/element-instances`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-instance-statistics.api)

- No input adjustments.

Response structure changes.

| **Field**      | **Change Type** | **Notes**               |
| -------------- | --------------- | ----------------------- |
| Response items | Moved           | Now under `items` array |
| `activityId`   | Renamed         | Now `elementId`         |

#### Get sequence flows of process instance by key

V1
V2

GET `/v1/process-instances/{key}/sequence-flows`

GET [`/v2/process-instances/{processInstanceKey}/sequence-flows`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-instance-sequence-flows.api)

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
