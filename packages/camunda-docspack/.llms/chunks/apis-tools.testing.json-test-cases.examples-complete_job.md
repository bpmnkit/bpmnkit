# JSON test cases — Examples — COMPLETE_JOB

An instruction to complete a job. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#complete-jobs) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "COMPLETE_JOB"
    string
    Yes
    
  
  
    jobSelector
    The selector to identify the job to complete.
    JobSelector
    Yes
    
  
  
    variables
    The variables to complete the job with.
    object
    No
    
  
  
    useExampleData
    Whether to complete the job with example data from the BPMN element. This property has precedence over variables.
    boolean
    No
    false
  

Example:

```json
{
  "type": "COMPLETE_JOB",
  "jobSelector": {
    "jobType": "analyze-moon-samples"
  },
  "variables": {
    "analysisResult": "high-mineral-content"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
