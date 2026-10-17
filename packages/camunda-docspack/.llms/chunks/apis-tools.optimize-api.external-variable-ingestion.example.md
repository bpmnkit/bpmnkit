# External variable ingestion — Example

### Request

POST `/api/ingestion/variable`

Request Body:

```
     [
      {
          "id": "7689fced-2639-4408-9de1-cf8f72769f43",
          "name": "address",
          "type": "string",
          "value": "Main Street 1",
          "processInstanceId": "c6393461-02bb-4f62-a4b7-f2f8d9bbbac1",
          "processDefinitionKey": "shippingProcess"
      },
      {
          "id": "993f4e73-7f6a-46a6-bd45-f4f8e3470ba1",
          "name": "amount",
          "type": "integer",
          "value": "500",
          "processInstanceId": "8282ed49-2243-44df-be5e-1bf893755d8f",
          "processDefinitionKey": "orderProcess"
      }
    ]
```

### Response

Status 204.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion
