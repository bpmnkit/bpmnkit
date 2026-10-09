# JSON test cases — Examples — BROADCAST_SIGNAL

An instruction to broadcast a signal.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "BROADCAST_SIGNAL"
    string
    Yes
    
  
  
    signalName
    The name of the signal to broadcast.
    string
    Yes
    
  
  
    variables
    The variables to broadcast with the signal.
    object
    No
    
  

Example:

```json
{
  "type": "BROADCAST_SIGNAL",
  "signalName": "EmergencyEvacuation",
  "variables": {
    "reason": "meteor-shower",
    "destination": "space-station"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
