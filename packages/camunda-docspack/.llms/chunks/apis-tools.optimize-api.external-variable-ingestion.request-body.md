# External variable ingestion — Request body

The request body contains an array of variable JSON Objects:

| Name                 | Type   | Constraints | Description                                                                                       |
| -------------------- | ------ | ----------- | ------------------------------------------------------------------------------------------------- |
| id                   | String | REQUIRED    | The unique identifier of this variable.                                                           |
| name                 | String | REQUIRED    | The name of the variable.                                                                         |
| type                 | String | REQUIRED    | The type of the variable. Must be one of: String, Short, Long, Double, Integer, Boolean, or Date. |
| value                | String | REQUIRED    | The current value of the variable.                                                                |
| processInstanceId    | String | REQUIRED    | The ID of the process instance this variable is to be associated with.                            |
| processDefinitionKey | String | REQUIRED    | The definition key of the process instance this variable is to be associated with.                |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion
