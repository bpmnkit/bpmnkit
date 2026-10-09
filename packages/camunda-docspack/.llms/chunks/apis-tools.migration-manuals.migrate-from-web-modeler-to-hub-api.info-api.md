# Migrate from Web Modeler to the Camunda Hub API — Info API

### Endpoint mapping

The info API endpoint has a Camunda Hub API v2 equivalent:

| Operation | Web Modeler API v1 | Camunda Hub API v2 |
| --------- | ------------------ | ------------------ |
| Get info  | `GET /v1/info`     | `GET /v2/info`     |

### Get info

The following response fields have changed:

| Web Modeler API v1         | Camunda Hub API v2         | Notes     |
| -------------------------- | -------------------------- | --------- |
| `version` (returns `"v1"`) | `version` (returns `"v2"`) | New value |
| `createPermission`         | -                          | Removed   |
| `readPermission`           | -                          | Removed   |
| `updatePermission`         | -                          | Removed   |
| `deletePermission`         | -                          | Removed   |

To determine your permissions, check the scopes you configured when creating your API token. If a request lacks the required permission, the API returns `403 Forbidden` with a `ProblemDetail` body explaining which permission is missing.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
