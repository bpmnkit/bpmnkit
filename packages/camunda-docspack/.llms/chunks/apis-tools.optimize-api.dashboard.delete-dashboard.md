# Delete dashboards

The REST API to delete dashboards from Optimize.

The dashboards deletion API allows you to delete dashboards by ID from Optimize.

**Note: Heads up!**
The deletion of a dashboard does not affect the referenced reports.


## Method & HTTP target resource

DELETE `/api/public/dashboard/{dashboard-ID}`

Where `dashboard-ID` is the ID of the dashboard you wish to delete.


## Request headers

The following request headers have to be provided with every delete request:

| Header        | Constraints | Value                                                   |
| ------------- | ----------- | ------------------------------------------------------- |
| Authorization | REQUIRED    | See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/delete-dashboard
