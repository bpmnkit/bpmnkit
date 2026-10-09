# Migrate to the Orchestration Cluster API — Operate REST API — Incidents

#### Search incidents

V1
V2

POST `/v1/incidents/search`

POST [`/v2/incidents/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-incidents.api)

Request structure changes as outlined in [general changes][].

| **Field**              | **Change Type** | **Notes**                                             |
| ---------------------- | --------------- | ----------------------------------------------------- |
| `searchAfter`          | Renamed         | Now `after` in the `page` object.                     |
| `size`                 | Renamed         | Now `limit` in the `page` object.                     |
| `key`                  | Renamed         | Now `incidentKey` (changed from `int64` to `string`). |
| `type`                 | Renamed         | Now `errorType`.                                      |
| `message`              | Renamed         | Now `errorMessage`.                                   |
| `processInstanceKey`   | Changed         | Now `string` type instead of `int64`.                 |
| `processDefinitionKey` | Changed         | Now `string` type instead of `int64`.                 |
| `jobKey`               | Changed         | Now `string` type instead of `int64`.                 |

Response structure changes as outlined in [general changes][].

| **Field**              | **Change Type** | **Notes**                                             |
| ---------------------- | --------------- | ----------------------------------------------------- |
| `total`                | Moved           | Now `totalItems` in `page` object.                    |
| `sortValues`           | Replaced        | Now use `endCursor` in `page` object.                 |
| `key`                  | Renamed         | Now `incidentKey` (changed from `int64` to `string`). |
| `type`                 | Renamed         | Now `errorType`.                                      |
| `message`              | Renamed         | Now `errorMessage`.                                   |
| `processInstanceKey`   | Changed         | Now `string` type instead of `int64`.                 |
| `processDefinitionKey` | Changed         | Now `string` type instead of `int64`.                 |
| `jobKey`               | Changed         | Now `string` type instead of `int64`.                 |

#### Get incident by key

V1
V2

GET `/v1/incidents/{key}`

GET [`/v2/incidents/{incidentKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-incident.api)

- No input adjustments.

- Except for the response structure changes, all adjustments from [search incidents](#search-incidents) apply.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
