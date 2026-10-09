# Export dashboard definitions

The REST API to export dashboard definitions.

This API allows users to export dashboard definitions which can later be imported into another Optimize system. Note that exporting a dashboard also exports all reports contained within the dashboard. The dashboards to be exported may be within a Collection or private entities, the API has access to both.

The obtained list of entity exports can be imported into other Optimize systems either using the dedicated [import API](https://docs.camunda.io/docs/next/apis-tools/optimize-api/import-entities) or [via UI](https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/components/optimize/userguide/additional-features/export-import#importing-entities).


## Method & HTTP target resource

POST `/api/public/export/dashboard/definition/json`

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/export-dashboard-definitions
