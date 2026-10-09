# Migrate to the Orchestration Cluster API — Operate REST API — Decision definition (2)

Response structure changes as outlined in [general changes][].

| **Field**              | **Change Type** | **Notes**                                                     |
| ---------------------- | --------------- | ------------------------------------------------------------- |
| `total`                | Moved           | Now `totalItems` in `page` object.                            |
| `sortValues`           | Replaced        | Now use `endCursor` in `page` object.                         |
| `id`                   | Renamed         | Now `decisionInstanceId`.                                     |
| `key`                  | Renamed         | Now `decisionInstanceKey` (changed from `int64` to `string`). |
| `processDefinitionKey` | Changed         | Now `string` type instead of `int64`.                         |
| `processInstanceKey`   | Changed         | Now `string` type instead of `int64`.                         |
| `decisionId`           | Renamed         | Now `decisionDefinitionId`.                                   |
| `decisionName`         | Renamed         | Now `decisionDefinitionName`.                                 |
| `decisionVersion`      | Renamed         | Now `decisionDefinitionVersion`.                              |
| `decisionType`         | Renamed         | Now `decisionDefinitionType`.                                 |
| `evaluatedInputs`      | Removed         | No longer provided by endpoint.                               |
| `evaluatedOutputs`     | Removed         | No longer provided by endpoint.                               |

#### Get decision instance by id

V1
V2

GET `/v1/decision-instances/{id}`

GET [`/v2/decision-instances/{decisionInstanceId}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-decision-instances.api)

- No input adjustments.

The adjustments from [search decision instances](#search-decision-instances) apply, with the following exceptions: `evaluatedInputs` and `evaluatedOutputs` are present in the response payload (with `evaluatedOutputs` moved under `matchedRules`).

| **Field**                   | **Change Type** | **Notes**                               |
| --------------------------- | --------------- | --------------------------------------- |
| **evaluatedInputs object**  |                 |                                         |
| `id`                        | Renamed         | Now `inputId`.                          |
| `name`                      | Renamed         | Now `inputName`.                        |
| `value`                     | Renamed         | Now `inputValue`.                       |
| **evaluatedOutputs object** |                 |                                         |
| `id`                        | Renamed         | Now `outputId`.                         |
| `name`                      | Renamed         | Now `outputName`.                       |
| `value`                     | Renamed         | Now `outputValue`.                      |
| `ruleId`                    | Moved           | Now under `matchedRules` array objects. |
| `ruleIndex`                 | Moved           | Now under `matchedRules` array objects. |

#### Search decision requirements

V1
V2

POST `/v1/drd/search`

POST [`/v2/decision-requirements/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-decision-requirements.api)

Request structure changes as outlined in [general changes][].

| **Field**     | **Change Type** | **Notes**                                                         |
| ------------- | --------------- | ----------------------------------------------------------------- |
| `searchAfter` | Renamed         | Now `after` in the `page` object.                                 |
| `size`        | Renamed         | Now `limit` in the `page` object.                                 |
| `id`          | Renamed         | Now `decisionRequirementsKey` in filter object.                   |
| `key`         | Renamed         | Now `decisionRequirementsKey` (changed from `int64` to `string`). |
| `name`        | Renamed         | Now `decisionRequirementsName`.                                   |

Response structure changes as outlined in [general changes][].

| **Field**    | **Change Type** | **Notes**                                                         |
| ------------ | --------------- | ----------------------------------------------------------------- |
| `total`      | Moved           | Now `totalItems` in `page` object.                                |
| `sortValues` | Replaced        | Now use `endCursor` in `page` object.                             |
| `id`         | Renamed         | Now `decisionRequirementsKey`.                                    |
| `key`        | Renamed         | Now `decisionRequirementsKey` (changed from `int64` to `string`). |
| `name`       | Renamed         | Now `decisionRequirementsName`.                                   |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
