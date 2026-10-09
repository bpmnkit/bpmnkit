# JSON test cases — Examples — ASSERT_PROCESS_INSTANCE_MESSAGE_SUBSCRIPTION

An instruction to assert the state of a process instance message subscription. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#process-instance-message-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_PROCESS_INSTANCE_MESSAGE_SUBSCRIPTION"
    string
    Yes
    
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
    
  
  
    messageSelector
    The selector to identify the message.
    MessageSelector
    Yes
    
  
  
    state
    The expected state of the message subscription.
    enum: IS_WAITING, IS_NOT_WAITING, IS_CORRELATED
    Yes
    
  

Example:

```json
{
  "type": "ASSERT_PROCESS_INSTANCE_MESSAGE_SUBSCRIPTION",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "messageSelector": {
    "messageName": "AstronautReady"
  },
  "state": "IS_CORRELATED"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
