# JSON test cases — Examples — RESOLVE_INCIDENT

An instruction to resolve an incident. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#resolve-incidents) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "RESOLVE_INCIDENT"
    string
    Yes
    
  
  
    incidentSelector
    The selector to identify the incident to resolve.
    IncidentSelector
    Yes
    
  

Example:

```json
{
  "type": "RESOLVE_INCIDENT",
  "incidentSelector": {
    "elementId": "LaunchRocket"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
