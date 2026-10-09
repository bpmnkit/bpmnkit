# JSON test cases — Examples — ASSERT_ELEMENT_INSTANCE

An instruction to assert the state of an element instance. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#element-instance-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_ELEMENT_INSTANCE"
    string
    Yes
    
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
    
  
  
    elementSelector
    The selector to identify the element.
    ElementSelector
    Yes
    
  
  
    state
    The expected state of the element instance.
    enum: IS_ACTIVE, IS_COMPLETED, IS_TERMINATED
    Yes
    
  
  
    amount
    The expected amount of element instances in the given state.
    integer (minimum: 1)
    No
    1
  

Example:

```json
{
  "type": "ASSERT_ELEMENT_INSTANCE",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "elementSelector": {
    "elementId": "LaunchRocket"
  },
  "state": "IS_COMPLETED"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
