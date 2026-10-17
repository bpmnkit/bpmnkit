# Export report definitions

The REST API to export report definitions.

This API allows users to export report definitions which can later be imported into another Optimize system. The reports to be exported may be within a collection or private entities, the API has access to both.

The obtained list of entity exports can be imported into other Optimize systems either using the dedicated [import API](https://docs.camunda.io/docs/next/apis-tools/optimize-api/import-entities) or [via UI](https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/components/optimize/userguide/additional-features/export-import#importing-entities).


## Method & HTTP target resource

POST `/api/public/export/report/definition/json`


## Request headers

The following request headers have to be provided with every request:

| Header        | Constraints | Value                                               |
| ------------- | ----------- | --------------------------------------------------- |
| Authorization | REQUIRED    | [Authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/export-report-definitions
