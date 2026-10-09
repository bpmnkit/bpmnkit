# Export report result data — Request body

No request body is required.


## Result

| Content                   | Value                                                                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| searchRequestId           | The ID of the performed search. The following pages from this search can be retrieved by using this ID. For more information please refer to the section [Pagination](#pagination).            |
| numberOfRecordsInResponse | Number of records in the JSON Response. This is a number between [0, limit]                                                                                                                    |
| totalNumberOfRecords      | The total number of records (from all pages) for this report export                                                                                                                            |
| reportId                  | The ID of the exported report                                                                                                                                                                  |
| message                   | In case there is additional information relevant to this request, this field will contain a message describing it. The response will only contain this field if there is a message to be shown |
| data [Array]              | An array containing numberOfRecordsInResponse report data records in JSON Format                                                                                                               |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/get-data-export
