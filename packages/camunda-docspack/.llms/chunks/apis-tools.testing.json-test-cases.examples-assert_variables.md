# JSON test cases — Examples — ASSERT_VARIABLES

An instruction to assert the variables of a process instance. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#variable-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_VARIABLES"
    string
    Yes
    
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
    
  
  
    elementSelector
    The selector to identify the element for local variables.
    ElementSelector
    No
    
  
  
    variableNames
    The expected variable names.
    array of string
    No
    
  
  
    variables
    The expected variables with their values.
    object
    No
    
  

Example:

```json
{
  "type": "ASSERT_VARIABLES",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "variables": {
    "missionStatus": "completed",
    "astronautName": "Zee"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
