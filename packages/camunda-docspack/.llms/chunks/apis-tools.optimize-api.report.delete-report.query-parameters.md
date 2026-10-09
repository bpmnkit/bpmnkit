# Delete reports — Query parameters

No query parameters available.


## Request body

No request body is required.


## Result

No response body.


## Response codes

Possible HTTP response status codes:

| Code | Description                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| 204  | Request successful.                                                                                                        |
| 401  | Token incorrect or missing in HTTP header. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) on how to authenticate. |
| 404  | The requested report was not found, please check the provided report-ID.                                                   |
| 500  | Some error occurred while processing the request, best check the Optimize log.                                             |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/delete-report
