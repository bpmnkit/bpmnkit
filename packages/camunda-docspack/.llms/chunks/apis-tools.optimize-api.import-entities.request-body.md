# Import entities — Request body

The request body should contain a JSON array of entity definitions to be imported. These entity definitions may be obtained by using the [report](https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/export-report-definitions) or [dashboard](https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/export-dashboard-definitions) export APIs or by [manually exporting entities](https://docs.camunda.io/docs/next/apis-tools/optimize-api/components/optimize/userguide/additional-features/export-import#exporting-entities) via the Optimize UI.


## Result

The response contains a list of DTOs that specify the ID and entity type (`report` or `dashboard`) of each newly created entity in the target system.


## Response codes

Possible HTTP response status codes:

| Code | Description                                                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200  | Request successful.                                                                                                                                                                                      |
| 400  | The provided list of entities is invalid. This can occur if any of the above listed [prerequisites](#prerequisites) are not met. Check the `detailedMessage` of the error response for more information. |
| 401  | Token incorrect or missing in HTTP header. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) on how to authenticate.                                                                                |
| 404  | The given target collection ID does not exist.                                                                                                                                                           |
| 500  | Some error occurred while processing the request, best check the Optimize log.                                                                                                                           |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/import-entities
