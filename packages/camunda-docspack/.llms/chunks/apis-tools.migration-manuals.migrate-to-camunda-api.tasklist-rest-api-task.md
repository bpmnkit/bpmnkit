# Migrate to the Orchestration Cluster API — Tasklist REST API — Task

#### Save task draft variables

V1
V2

POST `/v1/tasks/{taskId}/variables`

This feature is not supported in V2 anymore. Use [setting variables][] as `local` to the user task's `elementInstanceKey` as a replacement.

#### Search task variables

V1
V2

POST `/v1/tasks/{taskId}/variables/search`

POST [`/v2/user-tasks/{userTaskKey}/variables/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-user-task-variables.api)

Request structure changes as outlined in [general changes][].

| **Field**          | **Change Type** | **Notes**                                                                    |
| ------------------ | --------------- | ---------------------------------------------------------------------------- |
| `variableNames`    | Renamed         | Now `name` in `filter` object (plain string or `{ "$in": [ "xyz", ... ] }`). |
| `includeVariables` | Removed         | Endpoint returns all variables associated with the user task.                |

Response structure changes as outlined in [general changes][].

| **Field**          | **Change Type** | **Notes**                                                                |
| ------------------ | --------------- | ------------------------------------------------------------------------ |
| `id`               | Renamed         | Now `variableKey` (unique system identifier of the variable).            |
| `previewValue`     | Renamed         | Now `value` (always represents variable value, may be truncated).        |
| `isValueTruncated` | Renamed         | Now `isTruncated` (see get variable endpoint for full value if needed).  |
| `draft`            | Removed         | Draft variables not supported in V2 (see save draft variables endpoint). |

For completed tasks, the V1 API returned snapshot variable values as they existed at completion time. The V2 API always returns the current runtime value of variables.

#### Search tasks

V1
V2

POST `/v1/tasks/search`

POST [`/v2/user-tasks/search`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-user-tasks.api)

Request structure changes as outlined in [general changes][].

| **Field**                 | **Change Type** | **Notes**                                                       |
| ------------------------- | --------------- | --------------------------------------------------------------- |
| `pageSize`                | Renamed         | Now `limit` in the `page` object.                               |
| `searchAfter`             | Renamed         | Now `after` in the `page` object.                               |
| `searchBefore`            | Renamed         | Now `before` in the `page` object.                              |
| `taskDefinitionId`        | Renamed         | Now `elementId` (user-provided identifier of the BPMN element). |
| `assigned`                | Renamed         | Now `assignee` with `{ "$exists": false }`.                     |
| `assignees`               | Renamed         | Now `assignee` with `{ "$in": [ "xyz", ... ] }`.                |
| `candidateGroups`         | Renamed         | Now `candidateGroup` with `{ "$in": [ "xyz", ... ] }`.          |
| `candidateUsers`          | Renamed         | Now `candidateUser` with `{ "$in": [ "xyz", ... ] }`.           |
| `tenantIds`               | Renamed         | Now `tenantId` with `{ "$in": [ "xyz", ... ] }`.                |
| `followUpDate`, `dueDate` | Changed         | Use `$gte` and `$lte` instead of `from` and `to`.               |
| `priority`                | Changed         | Filter keys need `$` prefix, supports new comparison options.   |
| `taskVariables`           | Split           | Now `localVariables` and `processInstanceVariables`.            |
| `searchAfterOrEqual`      | Removed         | No longer supported.                                            |
| `searchBeforeOrEqual`     | Removed         | No longer supported.                                            |
| `includeVariables`        | Removed         | Use separate search task variables endpoint.                    |
| `implementation`          | Removed         | V2 API supports only Camunda user tasks.                        |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
