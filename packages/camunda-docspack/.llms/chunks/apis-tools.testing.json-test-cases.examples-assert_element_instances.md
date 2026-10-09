# JSON test cases — Examples — ASSERT_ELEMENT_INSTANCES

An instruction to assert the state of multiple element instances. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#element-instance-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_ELEMENT_INSTANCES"
    string
    Yes
    
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
    
  
  
    elementSelectors
    The selectors to identify the elements.
    array of ElementSelector
    Yes
    
  
  
    state
    The expected state of the element instances.
    enum: IS_ACTIVE, IS_COMPLETED, IS_TERMINATED, IS_NOT_ACTIVE, IS_NOT_ACTIVATED, IS_ACTIVE_EXACTLY, IS_COMPLETED_IN_ORDER
    Yes
    
  

Example:

```json
{
  "type": "ASSERT_ELEMENT_INSTANCES",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "elementSelectors": [
    { "elementId": "PrepareMission" },
    { "elementId": "LaunchRocket" },
    { "elementId": "LandOnMoon" }
  ],
  "state": "IS_COMPLETED_IN_ORDER"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
