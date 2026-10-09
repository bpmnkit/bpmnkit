# JSON test cases — Examples — MOCK_JOB_WORKER_COMPLETE_JOB

An instruction to mock a job worker who completes jobs. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#complete-job) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "MOCK_JOB_WORKER_COMPLETE_JOB"
    string
    Yes
    
  
  
    jobType
    The job type to mock. This should match the zeebeJobType in the BPMN model.
    string
    Yes
    
  
  
    variables
    The variables to complete the job with.
    object
    No
    
  
  
    useExampleData
    Whether to use example data from the BPMN element. If true, the variables property is ignored.
    boolean
    No
    false
  

Example:

```json
{
  "type": "MOCK_JOB_WORKER_COMPLETE_JOB",
  "jobType": "calculate-trajectory",
  "variables": {
    "trajectory": "optimal",
    "fuelConsumption": 450
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
