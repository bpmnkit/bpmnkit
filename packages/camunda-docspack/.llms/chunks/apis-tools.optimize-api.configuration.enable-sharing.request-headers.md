# Enable sharing — Request headers

The following request headers must be provided with every request:

| Header        | Constraints | Value                                                   |
| ------------- | ----------- | ------------------------------------------------------- |
| Authorization | REQUIRED    | See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) |


## Query parameters

No query parameters necessary.


## Request body

An empty request body should be sent.


## Response codes

Possible HTTP Response Status codes:

| Code | Description                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| 204  | Request successful.                                                                                                        |
| 401  | Token incorrect or missing in HTTP header. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) on how to authenticate. |
| 500  | Some error occurred while processing the request, best check the Optimize log.                                             |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/configuration/enable-sharing
