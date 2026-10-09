# JSON test cases — Examples — COMPLETE_USER_TASK

An instruction to complete a user task. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#complete-user-tasks) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "COMPLETE_USER_TASK"
    string
    Yes
    
  
  
    userTaskSelector
    The selector to identify the user task to complete.
    UserTaskSelector
    Yes
    
  
  
    variables
    The variables to set when completing the user task. Ignored if useExampleData is true.
    object
    No
    
  
  
    useExampleData
    Whether to complete the user task with example data from the BPMN element. If true, the variables property is ignored.
    boolean
    No
    false
  

Example:

```json
{
  "type": "COMPLETE_USER_TASK",
  "userTaskSelector": {
    "elementId": "ReviewMissionPlan"
  },
  "variables": {
    "approved": true,
    "comments": "Mission plan looks good for moon exploration"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
