# JSON test cases — Examples — CONDITIONAL_BEHAVIOR

An instruction to register a conditional behavior that reacts to process state changes. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#conditional-behavior) for more details.

The conditions form a conjunction; the behavior fires only when every assertion succeeds. Actions are consumed in order: the first match fires the first action, the second match fires the second, and the last action repeats indefinitely.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "CONDITIONAL_BEHAVIOR"
    string
    Yes
    
  
  
    name
    A descriptive name for diagnostics and log messages.
    string
    No
    
  
  
    conditions
    The ASSERT_* instructions to watch. The behavior fires only when every condition succeeds (conjunction).
    array of instructions
    Yes
    
  
  
    actions
    The action instructions to execute when all conditions are met. Consumed in order; the last action repeats indefinitely.
    array of instructions
    Yes
    
  

Example:

```json
{
  "type": "CONDITIONAL_BEHAVIOR",
  "name": "auto-complete-review-task",
  "conditions": [
    {
      "type": "ASSERT_USER_TASK",
      "userTaskSelector": {
        "taskName": "Review Task"
      },
      "state": "IS_CREATED"
    }
  ],
  "actions": [
    {
      "type": "COMPLETE_USER_TASK",
      "userTaskSelector": {
        "taskName": "Review Task"
      },
      "variables": {
        "approved": true
      }
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
