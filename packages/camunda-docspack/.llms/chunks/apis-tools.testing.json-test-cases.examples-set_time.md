# JSON test cases — Examples — SET_TIME

An instruction to set the time. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#set-time) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "SET_TIME"
    string
    Yes
    
  
  
    time
    The time to set, in ISO 8601 instant format (for example, "2026-01-19T13:00:00Z").
    string
    Yes
    
  

Example:

```json
{
  "type": "SET_TIME",
  "time": "2026-03-15T10:00:00Z"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
