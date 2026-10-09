# Migrate to the Orchestration Cluster API — Tasklist REST API — Variables

#### Get a variable

V1
V2

GET `/v1/variables/{variableId}`

GET [`/v2/variables/{variableKey}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-variable.api)

- `variableId` - Use `variableKey` as this refers to the unique system identifier of the variable.

- Renamed attributes
  - `id` - Use `variableKey` as this refers to the unique system identifier of the variable.
- Removed attributes
  - `draft` - Draft variables are not supported in V2 anymore, see also the [save draft variables](#save-task-draft-variables) endpoint for further details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
