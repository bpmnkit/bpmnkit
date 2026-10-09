# Migrate from Web Modeler to the Camunda Hub API — Dropped endpoints

The following v1 endpoints have no v2 equivalent:

| Web Modeler API v1                                     | Notes                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `POST /v1/milestones`                                  | Milestones were deprecated in Camunda 8.7. Use the [Versions API](#version-api) instead. |
| `GET /v1/milestones/{milestoneId}`                     | Use the [Versions API](#version-api) instead.                                            |
| `PATCH /v1/milestones/{milestoneId}`                   | Use the [Versions API](#version-api) instead.                                            |
| `DELETE /v1/milestones/{milestoneId}`                  | Use the [Versions API](#version-api) instead.                                            |
| `GET /v1/versions/compare/{version1Id}...{version2Id}` | See [Compare two versions](#compare-two-versions).                                       |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
