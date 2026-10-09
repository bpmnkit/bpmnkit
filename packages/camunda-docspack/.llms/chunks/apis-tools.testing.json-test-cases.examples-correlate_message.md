# JSON test cases — Examples — CORRELATE_MESSAGE

An instruction to correlate a message.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "CORRELATE_MESSAGE"
    string
    Yes
    
  
  
    name
    The name of the message.
    string
    Yes
    
  
  
    correlationKey
    The correlation key of the message.
    string
    No
    
  
  
    variables
    The variables to correlate with the message.
    object
    No
    
  

Example:

```json
{
  "type": "CORRELATE_MESSAGE",
  "name": "AstronautReady",
  "correlationKey": "mission-001",
  "variables": {
    "astronautName": "Zee",
    "status": "ready-for-launch"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
