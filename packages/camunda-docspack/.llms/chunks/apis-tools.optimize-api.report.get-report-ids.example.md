# Get report IDs — Example

### Retrieve all report IDs from a collection

To get all report IDs in the collection with the ID `1234`, send the following request:

GET `/api/public/report?collectionId=1234`

#### Request header

`Authorization: Bearer <TOKEN>`

##### Response

Status 200.

##### Response content

```
[
    {
        "id": "9b0eb845-e8ed-4824-bd85-8cd69038f2f5"
    },
    {
        "id": "1a866c7c-563e-4f6b-adf1-c4648531f7d4"
    }
]
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/report/get-report-ids
