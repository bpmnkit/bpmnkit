# Export dashboard definitions — Response codes

Possible HTTP response status codes:

| Code | Description                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| 204  | Request successful.                                                                                                        |
| 401  | Token incorrect or missing in HTTP header. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) on how to authenticate. |
| 404  | At least one of the given dashboard IDs does not exist.                                                                    |
| 500  | Some error occurred while processing the request, best check the Optimize log.                                             |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/export-dashboard-definitions
