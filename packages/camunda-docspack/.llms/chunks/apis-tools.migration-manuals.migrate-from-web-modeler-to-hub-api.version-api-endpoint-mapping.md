# Migrate from Web Modeler to the Camunda Hub API — Version API — Endpoint mapping

All version API endpoints have a Camunda Hub API v2 equivalent, except the compare versions endpoint:

| Operation            | Web Modeler API v1                                     | Camunda Hub API v2                           |
| -------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Create a version     | `POST /v1/versions`                                    | `POST /v2/versions`                          |
| Get a version        | `GET /v1/versions/{versionId}`                         | `GET /v2/versions/{versionKey}`              |
| Update a version     | `PATCH /v1/versions/{versionId}`                       | `PATCH /v2/versions/{versionKey}`            |
| Delete a version     | `DELETE /v1/versions/{versionId}`                      | `DELETE /v2/versions/{versionKey}`           |
| Search versions      | `POST /v1/versions/search`                             | `POST /v2/versions/search`                   |
| Restore a version    | `POST /v1/versions/{versionId}/restore`                | `POST /v2/versions/{versionKey}/restoration` |
| Compare two versions | `GET /v1/versions/compare/{version1Id}...{version2Id}` | [Does not exist](#compare-two-versions)      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
