# JSON test cases — Examples — EVALUATE_CONDITIONAL_START_EVENT

An instruction to evaluate conditional start events.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "EVALUATE_CONDITIONAL_START_EVENT"
    string
    Yes
    
  
  
    variables
    The variables to evaluate the conditional start events with.
    object
    Yes
    
  

Example:

```json
{
  "type": "EVALUATE_CONDITIONAL_START_EVENT",
  "variables": {
    "weatherCondition": "clear",
    "fuelLevel": 100
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
