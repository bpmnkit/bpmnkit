# JSON test cases — Examples — COMPLETE_JOB_USER_TASK_LISTENER

An instruction to complete a job of a user task listener. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#user-task-listener-jobs) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "COMPLETE_JOB_USER_TASK_LISTENER"
    string
    Yes
    
  
  
    jobSelector
    The selector to identify the job to complete.
    JobSelector
    Yes
    
  
  
    denied
    Whether the worker denies the work.
    boolean
    No
    false
  
  
    deniedReason
    The reason for denying the job.
    string
    No
    
  
  
    corrections
    The corrections to apply to the user task. Only applicable if denied is false.
    UserTaskCorrections
    No
    
  

#### User Task Corrections

The corrections to apply to a user task.

  
    Property
    Description
    Type
    Required
  
  
    assignee
    The assignee of the task.
    string
    No
  
  
    dueDate
    The due date of the task.
    string
    No
  
  
    followUpDate
    The follow up date of the task.
    string
    No
  
  
    candidateUsers
    The candidate users of the task.
    array of string
    No
  
  
    candidateGroups
    The candidate groups of the task.
    array of string
    No
  
  
    priority
    The priority of the task.
    integer
    No
  

Example:

```json
{
  "type": "COMPLETE_JOB_USER_TASK_LISTENER",
  "jobSelector": {
    "jobType": "validate-astronaut-assignment"
  },
  "corrections": {
    "assignee": "zee-senior-astronaut",
    "priority": 50
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
