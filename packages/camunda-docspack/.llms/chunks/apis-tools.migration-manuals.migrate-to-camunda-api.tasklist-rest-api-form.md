# Migrate to the Orchestration Cluster API — Tasklist REST API — Form

#### Get a form

V1
V2

GET `/v1/forms/{formId}`

GET [`/v2/user-tasks/{userTaskKey}/form`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-user-task-form.api)
GET [`/v2/process-definitions/{processDefinitionKey}/form`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-start-process-form.api)

- You cannot fetch forms directly anymore. Instead, fetch them by user task or process definition to get the respective form data.
- The respective endpoint only takes the key of the resource the form is related to as input parameter.

Embedded forms are no longer returned as Camunda user tasks don't support them.

| **Field**              | **Change Type** | **Notes**                                                   |
| ---------------------- | --------------- | ----------------------------------------------------------- |
| `id`                   | Renamed         | Now `formKey` (unique system identifier of the form).       |
| `title`                | Renamed         | Now `formId` (aligns with form schema attribute).           |
| `isDeleted`            | Removed         | No longer provided by endpoint.                             |
| `processDefinitionKey` | Removed         | Can be identified from endpoint resource and key parameter. |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
