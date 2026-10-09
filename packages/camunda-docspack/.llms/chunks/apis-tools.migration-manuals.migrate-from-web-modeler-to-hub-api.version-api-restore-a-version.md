# Migrate from Web Modeler to the Camunda Hub API — Version API — Restore a version

In Web Modeler API v1, the endpoint path uses `/restore`, and you pass the `versionId` in both the path and the request body:

```bash title="Web Modeler API v1"
POST /api/v1/versions/{versionId}/restore
{
  "versionId": {versionId}
}
```

In Camunda Hub API v2, the endpoint path uses `/restoration`, and you identify the version using the path parameter:

```bash title="Camunda Hub API v2"
POST /api/v2/versions/{versionKey}/restoration
(no body)
```

For element template files, include a `version` integer in the request body to set the target version number in the restored content:

```bash title="Camunda Hub API v2"
POST /api/v2/versions/{versionKey}/restoration
{ "version": 2 }
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
