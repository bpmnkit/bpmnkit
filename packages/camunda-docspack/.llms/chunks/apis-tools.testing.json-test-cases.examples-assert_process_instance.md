# JSON test cases — Examples — ASSERT_PROCESS_INSTANCE

An instruction to assert the state of a process instance. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#process-instance-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_PROCESS_INSTANCE"
    string
    Yes
    
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
    
  
  
    state
    The expected state of the process instance.
    enum: IS_ACTIVE, IS_COMPLETED, IS_CREATED, IS_TERMINATED
    No
    
  
  
    hasActiveIncidents
    Whether the process instance has active incidents.
    boolean
    No
    
  

Example:

```json
{
  "type": "ASSERT_PROCESS_INSTANCE",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "state": "IS_COMPLETED"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
