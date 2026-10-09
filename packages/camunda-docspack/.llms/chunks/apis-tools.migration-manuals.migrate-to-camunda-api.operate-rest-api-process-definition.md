# Migrate to the Orchestration Cluster API — Operate REST API — Process definition

#### Search process definitions

V1
V2

POST `/v1/process-definitions/search`

POST [`/v2/process-definitions/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-process-definitions.api)

Request structure changes as outlined in [general changes][].

| **Field**       | **Change Type** | **Notes**                                                      |
| --------------- | --------------- | -------------------------------------------------------------- |
| `searchAfter`   | Renamed         | Now `after` in the `page` object.                              |
| `size`          | Renamed         | Now `limit` in the `page` object.                              |
| `key`           | Renamed         | Now `processDefinitionKey` (changed from `int64` to `string`). |
| `bpmnProcessId` | Renamed         | Now `processDefinitionId`.                                     |

Response structure changes as outlined in [general changes][].

| **Field**       | **Change Type** | **Notes**                                                      |
| --------------- | --------------- | -------------------------------------------------------------- |
| `total`         | Moved           | Now `totalItems` in `page` object.                             |
| `sortValues`    | Replaced        | Now use `endCursor` in `page` object.                          |
| `key`           | Renamed         | Now `processDefinitionKey` (changed from `int64` to `string`). |
| `bpmnProcessId` | Renamed         | Now `processDefinitionId`.                                     |

#### Get process definition by key

V1
V2

GET `/v1/process-definitions/{key}`

GET [`/v2/process-definitions/{processDefinitionKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-definition.api)

- No input adjustments.

- Except for the response structure changes, all adjustments from [search process definitions](#search-process-definitions) apply.

#### Get process definition as XML by key

V1
V2

GET `/v1/process-definitions/{key}/xml`

GET [`/v2/process-definitions/{processDefinitionKey}/xml`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-definition-xml.api)

- No input adjustments.

- No output adjustments.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
