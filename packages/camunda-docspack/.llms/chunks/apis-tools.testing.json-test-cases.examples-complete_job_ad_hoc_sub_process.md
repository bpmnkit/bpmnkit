# JSON test cases — Examples — COMPLETE_JOB_AD_HOC_SUB_PROCESS

An instruction to complete a job of an ad-hoc sub-process. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#ad-hoc-sub-process-jobs) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "COMPLETE_JOB_AD_HOC_SUB_PROCESS"
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
    
  
  
    activateElements
    The elements to activate in the ad-hoc sub-process.
    array of ActivateElementInstruction
    No
    
  
  
    cancelRemainingInstances
    Whether to cancel remaining instances of the ad-hoc sub-process.
    boolean
    No
    false
  
  
    completionConditionFulfilled
    Whether the completion condition of the ad-hoc sub-process is fulfilled.
    boolean
    No
    false
  

#### Activate Element Instruction

An instruction to activate an element in an ad-hoc sub-process.

  
    Property
    Description
    Type
    Required
  
  
    elementId
    The ID of the element to activate.
    string
    Yes
  
  
    variables
    The variables to set when activating the element.
    object
    No
  

Example:

```json
{
  "type": "COMPLETE_JOB_AD_HOC_SUB_PROCESS",
  "jobSelector": {
    "elementId": "conduct-experiment"
  },
  "variables": {
    "experimentResult": "success"
  },
  "activateElements": [
    {
      "elementId": "CollectMoonSamples",
      "variables": {
        "sampleType": "regolith"
      }
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
