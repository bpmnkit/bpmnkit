# Variable labeling — Example 4

Attempting to insert multiple labels for the same variable will result to a 400 response code.

### Request

POST `/api/public/variables/labels`

Request Body:

```
      {
        "definitionKey": "someProcessDefinitionKey",
        "labels" : [
          {
            "variableName": "bookAvailable",
            "variableType": "Boolean",
            "variableLabel": "book availability"
          },
          {
            "variableName": "bookAvailable",
            "variableType": "Boolean",
            "variableLabel": "is book available"
          },
        ]
      }
```

### Response

Status 400.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/variable-labeling
