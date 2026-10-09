# Export dashboard definitions — Example

### Export two dashboards

To export the two dashboards with IDs `123` and `456`, send the following request:

POST `/api/public/export/dashboard/definition/json`

#### Request header

`Authorization: Bearer <TOKEN>`

#### Request body

```
[ "123", "456" ]
```

#### Response

Status 200.

#### Response content

The response contains the two exported dashboard definitions as well as all three process reports contained within the two dashboards.

```
[
    {
        "id": "61ae2232-51e1-4c35-b72c-c7152ba264f9",
        "exportEntityType": "single_process_report",
        "name": "Number: Process instance duration",
        "description": "This report shows the average instance duration",
        "sourceIndexVersion": 11,
        "collectionId": null,
        "data": {...}
    },
    {
        "id": "625c2411-b95f-4442-936b-1976b9511d4a",
        "exportEntityType": "single_process_report",
        "name": "Heatmap: Flownode count",
        "description": "This report shows a heatmap of the number of instances",
        "sourceIndexVersion": 11,
        "collectionId": null,
        "data": {...}
    },
    {
        "id": "94a7252e-d5c3-45ea-9906-75271cc0cac2",
        "exportEntityType": "single_process_report",
        "name": "Data Table: User task count",
        "description": "This report shows number of user tasks",
        "sourceIndexVersion": 11,
        "collectionId": null,
        "data": {...}
    },
    {
        "id": "123",
        "exportEntityType": "dashboard",
        "name": "Dashboard 1",
        "description": "A dashboard showing possible automation candidates",
        "sourceIndexVersion": 8,
        "reports": [
            {
                "id": "61ae2232-51e1-4c35-b72c-c7152ba264f9",
                ...
            },
            {
                "id": "625c2411-b95f-4442-936b-1976b9511d4a",
                ...
            }
        ],
        "availableFilters": [...],
        "collectionId": null
    },
    {
        "id": "456",
        "exportEntityType": "dashboard",
        "name": "Dashboard 2",
        "description": "A dashboard showing user task data",
        "sourceIndexVersion": 8,
        "reports": [
            {
                "id": "94a7252e-d5c3-45ea-9906-75271cc0cac2",
                ...
            }
        ],
        "availableFilters": [...],
        "collectionId": null
    }
]
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/export-dashboard-definitions
