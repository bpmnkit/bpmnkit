# JSON test cases — Examples — UPDATE_VARIABLES

An instruction to create or update process instance variables. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#update-variables) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "UPDATE_VARIABLES"
    string
    Yes
    
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
    
  
  
    variables
    The variables to create or update.
    object
    Yes
    
  
  
    elementSelector
    The selector to identify the element for local variables.
    ElementSelector
    No
    
  
  
    createLocalVariables
    Whether to create variables locally in the scope of the element (requires elementSelector). When true, variables are created in the element's local scope and are not propagated to parent scopes.
    boolean
    No
    false
  

Example:

```json
{
  "type": "UPDATE_VARIABLES",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "variables": {
    "currentPhase": "landing",
    "fuelRemaining": 75
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
