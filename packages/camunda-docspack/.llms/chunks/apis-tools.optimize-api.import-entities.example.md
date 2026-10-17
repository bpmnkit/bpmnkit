# Import entities — Example

### Import two entities

To import a report and a dashboard into the collection with the ID `123`, send the following request:

POST `/api/public/import?collectionId=123`

#### Request header

`Authorization: Bearer <TOKEN>`

#### Request body

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
        "id": "b0eb845-e8ed-4824-bd85-8cd69038f2f5",
        "exportEntityType": "dashboard",
        "name": "Dashboard 1",
        "description": "This dashboard displays reports relating to process durations",
        "sourceIndexVersion": 8,
        "reports": [
            {
                "id": "61ae2232-51e1-4c35-b72c-c7152ba264f9",
                ...
            }
        ],
        "availableFilters": [...],
        "collectionId": null
    }
]
```

#### Response

Status 200.

#### Response Content

```
[
    {
        "id": "e8ca18b9-e637-45c8-87da-0a2b08b34d6e",
        "entityType": "dashboard"
    },
    {
        "id": "290b3425-ba33-4fbb-b20b-a4f236036847",
        "entityType": "report"
    }
]
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/import-entities
