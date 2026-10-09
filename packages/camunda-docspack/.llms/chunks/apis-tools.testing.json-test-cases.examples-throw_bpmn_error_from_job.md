# JSON test cases — Examples — THROW_BPMN_ERROR_FROM_JOB

An instruction to throw a BPMN error from a job. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#throw-bpmn-errors-from-jobs) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "THROW_BPMN_ERROR_FROM_JOB"
    string
    Yes
    
  
  
    jobSelector
    The selector to identify the job to throw the error from.
    JobSelector
    Yes
    
  
  
    errorCode
    The error code to throw.
    string
    Yes
    
  
  
    errorMessage
    The error message to throw.
    string
    No
    
  
  
    variables
    The variables to set when throwing the error.
    object
    No
    
  

Example:

```json
{
  "type": "THROW_BPMN_ERROR_FROM_JOB",
  "jobSelector": {
    "jobType": "deploy-satellite"
  },
  "errorCode": "DEPLOYMENT_FAILED",
  "errorMessage": "Insufficient orbital velocity"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
