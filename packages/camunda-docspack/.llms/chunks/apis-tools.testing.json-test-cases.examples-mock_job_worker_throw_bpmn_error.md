# JSON test cases — Examples — MOCK_JOB_WORKER_THROW_BPMN_ERROR

An instruction to mock a job worker who throws BPMN errors. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#throw-bpmn-error) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "MOCK_JOB_WORKER_THROW_BPMN_ERROR"
    string
    Yes
    
  
  
    jobType
    The job type to mock. This should match the zeebeJobType in the BPMN model.
    string
    Yes
    
  
  
    errorCode
    The error code to throw. This should match the error code in an error catch event.
    string
    Yes
    
  
  
    errorMessage
    The error message to include when throwing the error.
    string
    No
    
  
  
    variables
    The variables to include when throwing the error.
    object
    No
    
  

Example:

```json
{
  "type": "MOCK_JOB_WORKER_THROW_BPMN_ERROR",
  "jobType": "launch-rocket",
  "errorCode": "WEATHER_UNSUITABLE",
  "errorMessage": "High winds detected"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
