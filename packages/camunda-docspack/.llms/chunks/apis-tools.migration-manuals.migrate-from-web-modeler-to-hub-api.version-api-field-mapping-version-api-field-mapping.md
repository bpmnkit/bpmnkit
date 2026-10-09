# Migrate from Web Modeler to the Camunda Hub API — Version API — Field mapping {#version-api-field-mapping}

The following fields have changed across all version endpoints:

| Web Modeler API v1 | Camunda Hub API v2 | Application      | Notes   |
| ------------------ | ------------------ | ---------------- | ------- |
| `fileId`           | `fileKey`          | Request/response | Renamed |
| `id`/`versionId`   | `versionKey`       | Response         | Renamed |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
