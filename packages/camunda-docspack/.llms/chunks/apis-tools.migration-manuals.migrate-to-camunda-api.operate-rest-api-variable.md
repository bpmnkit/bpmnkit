# Migrate to the Orchestration Cluster API — Operate REST API — Variable

#### Search variables for process instances

V1
V2

POST `/v1/variables/search`

POST [`/v2/variables/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-variables.api)

Request structure changes as outlined in [general changes][].

| **Field**            | **Change Type** | **Notes**                                             |
| -------------------- | --------------- | ----------------------------------------------------- |
| `searchAfter`        | Renamed         | Now `after` in the `page` object.                     |
| `size`               | Renamed         | Now `limit` in the `page` object.                     |
| `key`                | Renamed         | Now `variableKey` (changed from `int64` to `string`). |
| `processInstanceKey` | Changed         | Now `string` type instead of `int64`.                 |
| `scopeKey`           | Changed         | Now `string` type instead of `int64`.                 |
| `truncated`          | Renamed         | Now `isTruncated`.                                    |

Response structure changes as outlined in [general changes][].

| **Field**            | **Change Type** | **Notes**                                             |
| -------------------- | --------------- | ----------------------------------------------------- |
| `total`              | Moved           | Now `totalItems` in `page` object.                    |
| `sortValues`         | Replaced        | Now use `endCursor` in `page` object.                 |
| `key`                | Renamed         | Now `variableKey` (changed from `int64` to `string`). |
| `processInstanceKey` | Changed         | Now `string` type instead of `int64`.                 |
| `scopeKey`           | Changed         | Now `string` type instead of `int64`.                 |
| `truncated`          | Renamed         | Now `isTruncated`.                                    |

#### Get variable by key

V1
V2

GET `/v1/variables/{key}`

GET [`/v2/variables/{variableKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-variable.api)

- No input adjustments.

- All adjustments from [search variables for process instances](#search-variables-for-process-instances) apply, with the following exceptions:
  - Response structure changes.
  - `truncated` is removed because this endpoint always returns the full variable value.

<!--- TODO: open questions and related resources --->

<!--- TODO: insert link to C8 REST API guidelines --->

[setting variables]: /apis-tools/orchestration-cluster-api-rest/specifications/create-element-instance-variables.api.mdx
[general changes]: #general-endpoint-changes
[multi-tenancy]: /components/concepts/multi-tenancy.md

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
