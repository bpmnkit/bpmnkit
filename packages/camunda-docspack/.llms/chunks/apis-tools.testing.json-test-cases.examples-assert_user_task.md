# JSON test cases — Examples — ASSERT_USER_TASK

An instruction to assert the state of a user task. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#user-task-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_USER_TASK"
    string
    Yes
    
  
  
    userTaskSelector
    The selector to identify the user task.
    UserTaskSelector
    Yes
    
  
  
    state
    The expected state of the user task.
    enum: IS_CREATED, IS_COMPLETED, IS_CANCELED, IS_FAILED
    No
    
  
  
    assignee
    The expected assignee of the user task.
    string
    No
    
  
  
    candidateGroups
    The expected candidate groups of the user task.
    array of string
    No
    
  
  
    priority
    The expected priority of the user task.
    integer
    No
    
  
  
    elementId
    The expected element ID of the user task.
    string
    No
    
  
  
    name
    The expected name of the user task.
    string
    No
    
  
  
    dueDate
    The expected due date of the user task in ISO-8601 format.
    string
    No
    
  
  
    followUpDate
    The expected follow-up date of the user task in ISO-8601 format.
    string
    No
    
  

Example:

```json
{
  "type": "ASSERT_USER_TASK",
  "userTaskSelector": {
    "elementId": "ReviewMissionPlan"
  },
  "state": "IS_CREATED",
  "assignee": "zee-astronaut",
  "priority": 100
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
