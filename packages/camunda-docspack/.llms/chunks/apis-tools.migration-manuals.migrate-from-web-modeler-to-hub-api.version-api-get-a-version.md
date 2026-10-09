# Migrate from Web Modeler to the Camunda Hub API — Version API — Get a version

In Web Modeler API v1, version data in the response is nested under a `metadata` key:

```json title="Web Modeler API v1"
{
  "metadata": {
    "id": "c3e3a091-513e-4911-94d0-32aca88c80b9",
    "name": "V2",
    "description": "...",
    "fileId": "0ade583b-4022-47b5-8982-93ddd849ee6b",
    "created": "2026-06-09T16:50:37.186742Z",
    "createdBy": {
      "name": "...",
      "email": "..."
    },
    "updated": "2026-06-09T16:50:58.356172Z",
    "updatedBy": {
      "name": "...",
      "email": "..."
    },
    "organizationPublic": false
  },
  "content": "..."
}
```

In Camunda Hub API v2, version data is at the top level of the response body:

```json title="Camunda Hub API v2"
{
  "versionKey": "c3e3a091-513e-4911-94d0-32aca88c80b9",
  "name": "V2",
  "description": "...",
  "fileKey": "0ade583b-4022-47b5-8982-93ddd849ee6b",
  "organizationPublic": false,
  "created": "2026-06-09T16:50:37.186742Z",
  "createdBy": {
    "name": "...",
    "email": "..."
  },
  "updated": "2026-06-09T16:50:58.356172Z",
  "updatedBy": {
    "name": "...",
    "email": "..."
  },
  "content": "..."
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
