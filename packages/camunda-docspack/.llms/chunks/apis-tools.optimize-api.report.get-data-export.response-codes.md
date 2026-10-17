# Export report result data — Response codes

Possible HTTP response status codes:

| Code | Description                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| 200  | Request successful.                                                                                                        |
| 400  | Returned if some of the properties from the request are invalid or missing.                                                |
| 401  | Token incorrect or missing in HTTP header. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) on how to authenticate. |
| 404  | The requested report was not found, please check the provided report-ID.                                                   |
| 500  | Some error occurred while processing the export request, best check the Optimize log.                                      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/get-data-export
