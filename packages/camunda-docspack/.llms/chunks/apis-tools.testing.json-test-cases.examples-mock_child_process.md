# JSON test cases — Examples — MOCK_CHILD_PROCESS

An instruction to mock a child process. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#mock-child-processes) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "MOCK_CHILD_PROCESS"
    string
    Yes
    
  
  
    processDefinitionId
    The ID of the child process to mock.
    string
    Yes
    
  
  
    variables
    The variables to set for the mocked child process.
    object
    No
    
  
  
    versionTag
    The version tag for the deployed stub process. Required when the call activity uses bindingType="versionTag".
    string
    No
    
  

Example:

```json
{
  "type": "MOCK_CHILD_PROCESS",
  "processDefinitionId": "AstronautTrainingProcess",
  "variables": {
    "trainingCompleted": true,
    "grade": "excellent"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
