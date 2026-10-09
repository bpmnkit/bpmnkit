# Import entities

The REST API to import entity definitions.

This API allows users to import entity definitions such as reports and dashboards into existing collections. These entity definitions may be obtained either using the [report](https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/export-report-definitions) or [dashboard](https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/export-dashboard-definitions) export API or [via the UI](https://docs.camunda.io/docs/next/apis-tools/optimize-api/components/optimize/userguide/additional-features/export-import#exporting-entities).


## Prerequisites

For importing via API, the following prerequisites must be met:

- All definitions the entities require exist in the target Optimize.
- The target collection, identified using the `collectionId` query parameter, must exist in the target system.
- The collection data sources must include all relevant definitions for the entities.
- The entity data structures match. To ensure matching data structures, confirm that the Optimize version of the source is the same as the version of the target Optimize.

If any of the above conditions are not met, the import will fail with an error response; refer to the error message in the response for more information.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/import-entities
