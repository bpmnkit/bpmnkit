# JSON test cases — Examples — PUBLISH_MESSAGE

An instruction to publish a message.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "PUBLISH_MESSAGE"
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
    The variables to publish with the message.
    object
    No
    
  
  
    timeToLive
    The time-to-live of the message in milliseconds.
    integer
    No
    
  
  
    messageId
    The message ID for uniqueness.
    string
    No
    
  

Example:

```json
{
  "type": "PUBLISH_MESSAGE",
  "name": "LaunchApproved",
  "correlationKey": "mission-001",
  "variables": {
    "approvedBy": "mission-control",
    "launchWindow": "2026-03-15T10:00:00Z"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
