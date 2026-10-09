# Migrate Component V1 APIs — Migrate V1 APIs — Mapping Tasklist permissions to new authorizations

To maintain the same access level for the Tasklist V1 API, apply the following authorizations:

**`tasklist-api:read`** is replaced by:

- `PROCESS_DEFINITION:*:READ_PROCESS_DEFINITION,READ_USER_TASK`

**`taslist-api:write`** is replaced by:

- `PROCESS_DEFINITION:*:UPDATE_USER_TASK`

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-component-apis
