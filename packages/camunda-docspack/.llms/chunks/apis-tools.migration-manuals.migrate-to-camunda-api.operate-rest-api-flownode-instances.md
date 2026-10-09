# Migrate to the Orchestration Cluster API — Operate REST API — Flownode instances

#### Search flownode instances

V1
V2

POST `/v1/flownode-instances/search`

POST [`/v2/element-instances/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-element-instances.api)

Request structure changes as outlined in [general changes][].

| **Field**              | **Change Type** | **Notes**                                                    |
| ---------------------- | --------------- | ------------------------------------------------------------ |
| `searchAfter`          | Renamed         | Now `after` in the `page` object.                            |
| `size`                 | Renamed         | Now `limit` in the `page` object.                            |
| `key`                  | Renamed         | Now `elementInstanceKey` (changed from `int64` to `string`). |
| `flowNodeId`           | Renamed         | Now `elementId`.                                             |
| `flowNodeName`         | Renamed         | Now `elementName`.                                           |
| `incident`             | Renamed         | Now `hasIncident`.                                           |
| `processInstanceKey`   | Changed         | Now `string` type instead of `int64`.                        |
| `processDefinitionKey` | Changed         | Now `string` type instead of `int64`.                        |
| `incidentKey`          | Changed         | Now `string` type instead of `int64`.                        |
| `startDate`            | Removed         | Can no longer be used for filtering.                         |
| `endDate`              | Removed         | Can no longer be used for filtering.                         |

Response structure changes as outlined in [general changes][].

| **Field**              | **Change Type** | **Notes**                                                    |
| ---------------------- | --------------- | ------------------------------------------------------------ |
| `total`                | Moved           | Now `totalItems` in `page` object.                           |
| `sortValues`           | Replaced        | Now use `endCursor` in `page` object.                        |
| `key`                  | Renamed         | Now `elementInstanceKey` (changed from `int64` to `string`). |
| `flowNodeId`           | Renamed         | Now `elementId`.                                             |
| `flowNodeName`         | Renamed         | Now `elementName`.                                           |
| `incident`             | Renamed         | Now `hasIncident`.                                           |
| `processInstanceKey`   | Changed         | Now `string` type instead of `int64`.                        |
| `processDefinitionKey` | Changed         | Now `string` type instead of `int64`.                        |
| `incidentKey`          | Changed         | Now `string` type instead of `int64`.                        |

#### Get flownode instance by key

V1
V2

GET `/v1/flownode-instances/{key}`

GET [`/v2/element-instances/{elementInstanceKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-element-instance.api)

- No input adjustments.

- Except for the response structure changes, all adjustments from [search flownode instances](#search-flownode-instances) apply.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
