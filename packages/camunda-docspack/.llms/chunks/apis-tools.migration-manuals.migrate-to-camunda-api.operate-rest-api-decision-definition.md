# Migrate to the Orchestration Cluster API — Operate REST API — Decision definition

#### Search decision definitions

V1
V2

POST `/v1/decision-definitions/search`

POST [`/v2/decision-definitions/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-decision-definitions.api)

Request structure changes as outlined in [general changes][].

| **Field**                     | **Change Type** | **Notes**                                                       |
| ----------------------------- | --------------- | --------------------------------------------------------------- |
| `searchAfter`                 | Renamed         | Now `after` in the `page` object.                               |
| `size`                        | Renamed         | Now `limit` in the `page` object.                               |
| `id`                          | Renamed         | Now `decisionDefinitionKey` in filter object.                   |
| `key`                         | Renamed         | Now `decisionDefinitionKey` (changed from `int64` to `string`). |
| `decisionId`                  | Renamed         | Now `decisionDefinitionId` in filter object.                    |
| `decisionRequirementsKey`     | Changed         | Now `string` type instead of `int64`.                           |
| `decisionRequirementsName`    | Removed         | Can no longer be used for filtering.                            |
| `decisionRequirementsVersion` | Removed         | Can no longer be used for filtering.                            |

Response structure changes as outlined in [general changes][].

| **Field**                     | **Change Type** | **Notes**                                                       |
| ----------------------------- | --------------- | --------------------------------------------------------------- |
| `total`                       | Moved           | Now `totalItems` in `page` object.                              |
| `sortValues`                  | Replaced        | Now use `endCursor` in `page` object.                           |
| `id`                          | Renamed         | Now `decisionDefinitionKey`.                                    |
| `key`                         | Renamed         | Now `decisionDefinitionKey` (changed from `int64` to `string`). |
| `decisionId`                  | Renamed         | Now `decisionDefinitionId`.                                     |
| `decisionRequirementsKey`     | Changed         | Now `string` type instead of `int64`.                           |
| `decisionRequirementsName`    | Removed         | Fetch using get decision requirements endpoint.                 |
| `decisionRequirementsVersion` | Removed         | Fetch using get decision requirements endpoint.                 |

#### Get decision definition by key

V1
V2

GET `/v1/decision-definitions/{key}`

GET [`/v2/decision-definitions/{decisionDefinitionKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-decision-definition.api)

- No input adjustments.

- Except for the response structure changes, all adjustments from [search decision definitions](#search-decision-definitions) apply.

#### Search decision instances

V1
V2

POST `/v1/decision-instances/search`

POST [`/v2/decision-instances/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-decision-instances.api)

Request structure changes as outlined in [general changes][].

| **Field**              | **Change Type** | **Notes**                                                     |
| ---------------------- | --------------- | ------------------------------------------------------------- |
| `searchAfter`          | Renamed         | Now `after` in the `page` object.                             |
| `size`                 | Renamed         | Now `limit` in the `page` object.                             |
| `id`                   | Renamed         | Now `decisionInstanceId` in filter object.                    |
| `key`                  | Renamed         | Now `decisionInstanceKey` (changed from `int64` to `string`). |
| `processDefinitionKey` | Changed         | Now `string` type instead of `int64`.                         |
| `processInstanceKey`   | Changed         | Now `string` type instead of `int64`.                         |
| `decisionId`           | Renamed         | Now `decisionDefinitionId`.                                   |
| `decisionName`         | Renamed         | Now `decisionDefinitionName`.                                 |
| `decisionVersion`      | Renamed         | Now `decisionDefinitionVersion`.                              |
| `decisionType`         | Renamed         | Now `decisionDefinitionType`.                                 |
| `result`               | Removed         | Can no longer be used for filtering.                          |
| `evaluatedInputs`      | Removed         | Can no longer be used for filtering.                          |
| `evaluatedOutputs`     | Removed         | Can no longer be used for filtering.                          |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
