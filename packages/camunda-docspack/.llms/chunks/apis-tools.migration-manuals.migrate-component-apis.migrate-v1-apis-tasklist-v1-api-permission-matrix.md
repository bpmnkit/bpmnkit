# Migrate Component V1 APIs — Migrate V1 APIs — Tasklist V1 API permission matrix

To enable more fine-grained access control, the matrix below details the required permissions for each Tasklist V1 API endpoint.  
Ensure the user has general access (resource ID `*`) for each listed resource and permission type.

| Endpoint                                  | Resource Type      | Permission type  |
| ----------------------------------------- | ------------------ | ---------------- |
| `GET /v1/forms/:formId`                   | PROCESS_DEFINITION | READ_USER_TASK   |
| `POST /v1/tasks/search`                   | PROCESS_DEFINITION | READ_USER_TASK   |
| `GET /v1/tasks/:taskId`                   | PROCESS_DEFINITION | READ_USER_TASK   |
| `PATCH /v1/tasks/:taskId/assign`          | PROCESS_DEFINITION | UPDATE_USER_TASK |
| `PATCH /v1/tasks/:taskId/unassign`        | PROCESS_DEFINITION | UPDATE_USER_TASK |
| `PATCH /v1/tasks/:taskId/complete`        | PROCESS_DEFINITION | UPDATE_USER_TASK |
| `POST /v1/tasks/:taskId/variables`        | PROCESS_DEFINTION  | UPDATE_USER_TASK |
| `POST /v1/tasks/:taskId/variables/search` | PROCESS_DEFINITION | READ_USER_TASK   |
| `GET /v1/variables/:variableId`           | PROCESS_DEFINITION | READ_USER_TASK   |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-component-apis
