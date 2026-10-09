# Migrate from Web Modeler to the Camunda Hub API — File API — Update a file

A `revision` is now required to prevent overwriting concurrent changes. Fetch the current revision from a get or create response, and include it in your update request:

```json title="Camunda Hub API v2"
{
  "name": "process",
  "projectKey": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
  "folderKey": "62132025-57ff-4077-8c80-fc4ebe84aebe",
  // highlight-next-line
  "revision": 5,
  "content": "..."
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
