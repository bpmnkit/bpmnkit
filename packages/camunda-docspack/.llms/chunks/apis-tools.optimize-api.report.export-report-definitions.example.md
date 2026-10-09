# Export report definitions — Example

### Export two reports

To export the two reports with IDs `123` and `456`, send the following request:

POST `/api/public/export/report/definition/json`

#### Request header

`Authorization: Bearer <TOKEN>`

#### Request body

```
[ "123", "456" ]
```

#### Response

Status 200.

#### Response content

```
[
    {
        "id": "123",
        "exportEntityType": "single_process_report",
        "name": "Number: Process instance duration",
        "sourceIndexVersion": 8,
        "collectionId": "40cb3657-bdcb-459d-93ce-06877ac7244a",
        "data": {...}
    },
    {
        "id": "456",
        "exportEntityType": "single_process_report",
        "name": "Heatmap: Flownode count",
        "sourceIndexVersion": 8,
        "collectionId": "40cb3657-bdcb-459d-93ce-06877ac7244a",
        "data": {...}
    }
]
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/export-report-definitions
