# Migrate to the Orchestration Cluster API — Tasklist REST API — Task (2)

Response structure changes as outlined in [general changes][].

| **Field**          | **Change Type** | **Notes**                                                                             |
| ------------------ | --------------- | ------------------------------------------------------------------------------------- |
| `sortValues`       | Removed         | No longer exist per result item - use `startCursor` and `endCursor` in `page` object. |
| `id`               | Renamed         | Now `userTaskKey` (unique system identifier of the user task).                        |
| `taskDefinitionId` | Renamed         | Now `elementId` (user-provided identifier of the BPMN element).                       |
| `taskState`        | Renamed         | Now `state` (user task's current state).                                              |
| `processName`      | Renamed         | Now `processDefinitionId` (user-provided identifier of the process).                  |
| `formKey`          | Changed         | Now unique system identifier referencing linked Camunda form in specific version.     |
| `isFirst`          | Removed         | No longer identifies if task was first in process.                                    |
| `variables`        | Removed         | Use search user task variables endpoint.                                              |
| `implementation`   | Removed         | V2 API supports only Camunda user tasks.                                              |
| `isFormEmbedded`   | Removed         | V2 API does not support embedded forms.                                               |
| `formVersion`      | Removed         | Use get user task form endpoint.                                                      |
| `formId`           | Removed         | Use get user task form endpoint.                                                      |

#### Unassign a task

V1
V2

PATCH `/v1/tasks/{taskId}/unassign`

DELETE [`/v2/user-tasks/{userTaskKey}/assignee`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/unassign-user-task.api)

- No input adjustments.

- Response object removed - The V2 API returns a 204 status, indicating that the task was unassigned. Fetching the updated data of the user task should be done through the respective API since the data can change concurrently at any time.

#### Complete a task

V1
V2

PATCH `/v1/tasks/{taskId}/complete`

POST [`/v2/user-tasks/{userTaskKey}/completion`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/complete-user-task.api)

- Adjusted attributes
  - `variables` - Provide the variables as a proper JSON object instead of an array of objects with a `name` and a serialized JSON string `value`.

- Response object removed - The V2 API returns a 204 status, indicating that the task was completed. Fetching the updated data of the user task should be done through the respective API since the data can change concurrently at any time.

#### Assign a task

V1
V2

PATCH `/v1/tasks/{taskId}/assign`

POST [`/v2/user-tasks/{userTaskKey}/assignment`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/assign-user-task.api)

- Renamed attributes
  - `allowOverrideAssignment` - Use `allowOverride`, this still refers to allowing to override any existing assignee.

- Response object removed - The V2 API returns a 204 status, indicating that the task was assigned. Fetching the updated data of the user task should be done through the respective API since the data can change concurrently at any time.

#### Get a task

V1
V2

GET `/v1/tasks/{taskId}`

GET [`/v2/user-tasks/{userTaskKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-user-task.api)

- No input adjustments.

- Except for the response structure changes, all adjustments from [search tasks](#search-tasks) apply.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
