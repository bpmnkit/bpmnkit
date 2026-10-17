# Export dashboard definitions — Request headers

The following request headers have to be provided with every request:

| Header        | Constraints | Value                                               |
| ------------- | ----------- | --------------------------------------------------- |
| Authorization | REQUIRED    | [Authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) |


## Query parameters

No query parameters available.


## Request body

The request body should contain a JSON array of dashboard IDs to be exported.


## Result

The response contains a list of exported dashboard definitions as well as all report definitions contained within the dashboards.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/export-dashboard-definitions
