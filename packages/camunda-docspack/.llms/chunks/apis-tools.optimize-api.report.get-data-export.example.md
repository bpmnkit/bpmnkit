# Export report result data — Example

### Export a raw data report

To export the report with the ID `e6c5abb1-6a18-44e7-8480-d562d511ba62`, send the following request. It uses a maximum of two records per page and a pagination timeout of 60s.

#### Initial API call

GET `/api/public/export/report/e6c5aaa1-6a18-44e7-8480-d562d511ba62/result/json? paginationTimeout=60&limit=2`

##### Request header

`Authorization: Bearer <TOKEN>`

##### Response content

```
    {
      "searchRequestId": "FGluY2x1ZGVfY29udGV4dF91dWlkDXF1ZXJ",
      "numberOfRecordsInResponse": 2,
      "totalNumberOfRecords": 11,
      "reportId": "e6c5abb1-6a18-44e7-8480-d562d511ba62",
      "data": [
          {
              "processDefinitionKey": "aProcess",
              "processDefinitionId": "aProcess:1:1801",
              "processInstanceId": "1809",
              "businessKey": "aBusinessKey",
              "startDate": "2021-12-02T17:21:49.330+0200",
              "endDate": "2021-12-02T17:21:49.330+0200",
              "duration": 0,
              "engineName": "camunda-bpm",
              "tenantId": null,
              "variables": {}
          },
          {
              "processDefinitionKey": "aProcess",
              "processDefinitionId": "aProcess:1:1801",
              "processInstanceId": "1804",
              "businessKey": "aBusinessKey",
              "startDate": "2021-12-02T17:21:49.297+0200",
              "endDate": "2021-12-02T17:21:49.298+0200",
              "duration": 1,
              "engineName": "camunda-bpm",
              "tenantId": null,
              "variables": {}
          }
      ]
    }
```

##### Response

Status 200.

#### Subsequent API calls

Note here the use of the query parameter `searchRequestId` to retrieve further pages from the initial search.

`GET /api/public/export/report/e6c5aaa1-6a18-44e7-8480-d562d511ba62/result/json?paginationTimeout=60&searchRequestId=FGluY2x1ZGVfY29udGV4dF91dWlkDXF1ZXJ&limit=2`

##### Request header

`Authorization: Bearer <TOKEN>`

##### Response content

```
    {
      "searchRequestId": "FGluY2x1ZGVfY29udGV4dF91dWlkDXF1ZXJ",
      "numberOfRecordsInResponse": 2,
      "totalNumberOfRecords": 11,
      "reportId": "e6c5abb1-6a18-44e7-8480-d562d511ba62",
      "data": [
          {
              "processDefinitionKey": "aProcess",
              "processDefinitionId": "aProcess:1:1bc9474d-5762-11ec-8b2c-0242ac120003",
              "processInstanceId": "1bdafab8-5762-11ec-8b2c-0242ac120003",
              "businessKey": "aBusinessKey",
              "startDate": "2021-12-07T15:32:22.739+0200",
              "endDate": "2021-12-07T15:32:22.740+0200",
              "duration": 1,
              "engineName": "camunda-bpm",
              "tenantId": null,
              "variables": {}
          },
          {
              "processDefinitionKey": "aProcess",
              "processDefinitionId": "aProcess:1:1bc9474d-5762-11ec-8b2c-0242ac120003",
              "processInstanceId": "1bda3763-5762-11ec-8b2c-0242ac120003",
              "businessKey": "aBusinessKey",
              "startDate": "2021-12-07T15:32:22.735+0200",
              "endDate": "2021-12-07T15:32:22.735+0200",
              "duration": 0,
              "engineName": "camunda-bpm",
              "tenantId": null,
              "variables": {}
          }
      ]
    }
```

##### Response

Status 200.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/get-data-export
