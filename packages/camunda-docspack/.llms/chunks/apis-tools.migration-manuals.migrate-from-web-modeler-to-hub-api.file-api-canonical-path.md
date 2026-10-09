# Migrate from Web Modeler to the Camunda Hub API — File API — Canonical path

In Web Modeler API v1, `canonicalPath` is an array of objects containing an `id` and a `name` for each path element in the file's unique path:

```json title="Web Modeler API v1"
{
  "canonicalPath": [
    {
      "id": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
      "name": "Process application"
    },
    {
      "id": "b06c97f5-7e39-4108-b947-2848fdc023f0",
      "name": "Parent folder"
    },
    {
      "id": "62132025-57ff-4077-8c80-fc4ebe84aebe",
      "name": "Child folder"
    }
  ]
}
```

In Camunda Hub API v2, `canonicalPath` expresses the file's unique path as a `/`-delimited string. Unlike Web Modeler API v1, which includes `projects` ([called `process applications` before Camunda 8.10](#structure-and-terminology)), Camunda Hub API v2 only includes folder keys. The project is given in a separate field, called `projectKey`:

```json title="Camunda Hub API v2"
{
  "projectKey": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
  "canonicalPath": "b06c97f5-7e39-4108-b947-2848fdc023f0/62132025-57ff-4077-8c80-fc4ebe84aebe"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
