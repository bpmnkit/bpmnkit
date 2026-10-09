# Delete dashboards — Query parameters

No query parameters available.


## Request body

No request body is required.


## Result

No response body.


## Response codes

Possible HTTP Response status codes:

| Code | Description                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| 204  | Request successful.                                                                                                        |
| 401  | Token incorrect or missing in HTTP header. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) on how to authenticate. |
| 404  | The requested dashboard was not found, please check the provided dashboard-ID.                                             |
| 500  | Some error occurred while processing the request, best check the Optimize log.                                             |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/delete-dashboard
