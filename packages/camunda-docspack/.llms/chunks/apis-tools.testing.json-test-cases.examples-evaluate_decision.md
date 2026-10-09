# JSON test cases — Examples — EVALUATE_DECISION

An instruction to evaluate a DMN decision.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "EVALUATE_DECISION"
    string
    Yes
    
  
  
    decisionDefinitionSelector
    The selector to identify the decision definition to evaluate.
    DecisionDefinitionSelector
    Yes
    
  
  
    variables
    The variables to evaluate the decision with.
    object
    No
    
  

Example:

```json
{
  "type": "EVALUATE_DECISION",
  "decisionDefinitionSelector": {
    "decisionDefinitionId": "ChooseRocket"
  },
  "variables": {
    "payload": 5000,
    "destination": "Moon"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
