# JSON test cases — Examples — INCREASE_TIME

An instruction to increase the time. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#increase-time) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "INCREASE_TIME"
    string
    Yes
    
  
  
    duration
    The duration to increase the time by, in ISO 8601 duration format (for example, "PT1H", "P2D").
    string
    Yes
    
  

Example:

```json
{
  "type": "INCREASE_TIME",
  "duration": "P3D"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
