# Migrate Component V1 APIs — Migrate V1 APIs — Operate V1 API permission matrix

To enable more fine-grained access control, the matrix below details the required permissions for each Operate V1 API endpoint.
Ensure the user has general access (resource ID `*`) for each listed resource and permission type.

| Endpoint                                        | Resource Type                    | Permission type          |
| ----------------------------------------------- | -------------------------------- | ------------------------ |
| `POST /v1/process-definitions/search`           | PROCESS_DEFINITION               | READ_PROCESS_DEFINITION  |
| `GET /v1/process-definitions/:key`              | PROCESS_DEFINITION               | READ_PROCESS_DEFINITION  |
| `GET v1/process-definitions/:key/xml`           | PROCESS_DEFINITION               | READ_PROCESS_DEFINITION  |
| `POST /v1/decision-definitions/search`          | DECISION_DEFINITION              | READ_DECISION_DEFINITION |
| `GET /v1/decision-definitions/:key`             | DECISION_DEFINITION              | READ_DECISION_DEFINITION |
| `POST /v1/decision-instances/search`            | DECISION_DEFINITION              | READ_DECISION_INSTANCE   |
| `GET /v1/decision-instances/:id`                | DECISION_DEFINITION              | READ_DECISION_INSTANCE   |
| `POST /v1/flownode-instances/search`            | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `GET /v1/flownode-instances/:key`               | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `POST /v1/variables/search`                     | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `GET /v1/variables/:key`                        | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `POST /v1/process-instances/search`             | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `GET /v1/process-instances/:key`                | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `GET /v1/process-instances/:key/statistics`     | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `GET /v1/process-instances/:key/sequence-flows` | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `DEL /v1/process-instances/:key`                | PROCESS_DEFINITION               | DELETE_PROCESS_INSTANCE  |
| `POST /v1/drd/search`                           | DECISION_REQUIREMENTS_DEFINITION | READ                     |
| `GET /v1/drd/:key`                              | DECISION_REQUIREMENTS_DEFINITION | READ                     |
| `GET /v1/drd/:key/xml`                          | DECISION_REQUIREMENTS_DEFINITION | READ                     |
| `POST /v1/incidents/search`                     | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |
| `GET /v1/incidents/:key`                        | PROCESS_DEFINITION               | READ_PROCESS_INSTANCE    |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-component-apis
