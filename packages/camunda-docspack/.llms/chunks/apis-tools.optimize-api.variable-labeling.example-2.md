# Variable labeling — Example 2

Delete a label for a variable belonging to a given process definition by inputting an empty
string for its value. If there is no label for the given variable in Elasticsearch, no operation is being conducted.

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
            "variableLabel": ""
          }
        ]
      }
```

### Response

Status 204.


## Example 3

Insert and delete labels for two variables belonging to a given process definition. The following example adds a label for the variable with name **bookAvailable** and deletes a label for the variable with name **person.name**.

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
             "variableLabel": ""
           },
         ]
       }
```

### Response

Status 204.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/variable-labeling
