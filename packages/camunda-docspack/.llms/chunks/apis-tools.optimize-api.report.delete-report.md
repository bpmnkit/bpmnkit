# Delete reports

The REST API to delete reports from Optimize.

The report deletion API allows you to delete reports by ID from Optimize.

**Note: Heads up!**
During deletion a report will get removed from any dashboard or combined process report it is referenced by. In case a report is referenced by an alert, the corresponding alert will get deleted too.


## Method & HTTP target resource

DELETE `/api/public/report/{report-ID}`

Where `report-ID` is the ID of the report you wish to delete.


## Request headers

The following request headers have to be provided with every delete request:

| Header        | Constraints | Value                                                   |
| ------------- | ----------- | ------------------------------------------------------- |
| Authorization | REQUIRED    | See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/delete-report
