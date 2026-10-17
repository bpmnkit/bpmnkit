# Variable labeling — Example 1

Insert three labels for three variable for a given process definition

**Note**
If the label exists already in the index, its value will be overridden.

### Request

POST `/api/public/variables/labels`

Request Body:

```
        {
          "definitionKey": "bookrequest-1-tenant",
          "labels" : [
            {
              "variableName": "bookAvailable",
              "variableType": "Boolean",
              "variableLabel": "book availability"
            },
            {
              "variableName": "person.name",
              "variableType": "String",
              "variableLabel": "first and last name"
            },
            {
              "variableName": "person.hobbies._listSize",
              "variableType": "Long",
              "variableLabel": "amount of hobbies"
            }
          ]
        }
```

### Response

Status 204.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/variable-labeling
