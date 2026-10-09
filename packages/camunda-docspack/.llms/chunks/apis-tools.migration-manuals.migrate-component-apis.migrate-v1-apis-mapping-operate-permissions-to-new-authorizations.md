# Migrate Component V1 APIs — Migrate V1 APIs — Mapping Operate permissions to new authorizations

To maintain the same access level for the Operate V1 API, apply the following authorizations:

**`operate-api:read`** is replaced by:

- `PROCESS_DEFINITION:*:READ_PROCESS_DEFINITION,READ_PROCESSINSTANCE`
- `DECISION_DEFINITION:*:READ_DECISION_DEFINITION`
- `DECISION_REQUIREMENTS_DEFINITION:*:READ`

**`operate-api:write`** is replaced by:

- `PROCESS_DEFINITION:*:DELETE_PROCESS_INSTANCES`

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-component-apis
