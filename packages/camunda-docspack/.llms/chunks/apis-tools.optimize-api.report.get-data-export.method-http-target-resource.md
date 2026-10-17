# Export report result data — Method & HTTP target resource

GET `/api/public/export/report/{report-ID}/result/json`

Where `report-ID` is the ID of the report you wish to export.


## Request headers

The following request headers have to be provided with every data export request:

| Header        | Constraints | Value                                               |
| ------------- | ----------- | --------------------------------------------------- |
| Authorization | REQUIRED    | [Authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) |


## Query parameters

The following query parameters have to be provided with every data export request:

| Parameter         | Constraints | Value                                                                                                                                                                                                                                                              |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| limit             | REQUIRED    | Maximum number of records per page. Please note that the limit will only be considered when performing the request for the first page of a raw data report. The following requests for a given searchRequestId will have the same page size as the first request.  |
| paginationTimeout | REQUIRED    | The amount of time (in seconds) for which a search context will be held in memory, so that the remaining pages of the result can be retrieved. For more information on how to paginate through the results, please refer to the section [Pagination](#pagination). |
| searchRequestId   | Optional    | The ID of a previous search for which you wish to retrieve the next page of results. For more information on how to get and use a searchRequestId please refer to the section [Pagination](#pagination).                                                           |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/get-data-export
