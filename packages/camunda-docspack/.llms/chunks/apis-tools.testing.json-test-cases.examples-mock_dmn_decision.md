# JSON test cases — Examples — MOCK_DMN_DECISION

An instruction to mock a DMN decision. See the [utilities documentation](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#mock-dmn-decisions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "MOCK_DMN_DECISION"
    string
    Yes
    
  
  
    decisionDefinitionId
    The decision definition ID to mock.
    string
    Yes
    
  
  
    variables
    The variables to set as the decision output. Deprecated, use decisionOutput.
    object
    No
    
  
  
    decisionOutput
    The decision output to mock. Can be any JSON type.
    any
    No
    
  

Example:

```json
{
  "type": "MOCK_DMN_DECISION",
  "decisionDefinitionId": "ChooseRocket",
  "decisionOutput": "Falcon Heavy"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
