# JSON test cases — Examples — ASSERT_DECISION

An instruction to assert the evaluation of a decision. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#decision-assertions) for more details.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "ASSERT_DECISION"
    string
    Yes
    
  
  
    decisionSelector
    The selector to identify the decision.
    DecisionSelector
    Yes
    
  
  
    output
    Expected output of the decision. Can be any JSON type.
    any
    No
    
  
  
    matchedRules
    Expected matched rule indexes
    array of integer
    No
    
  
  
    notMatchedRules
    Expected not matched rule indexes
    array of integer
    No
    
  
  
    noMatchedRules
    Assert that no rules were matched
    boolean
    No
    false
  

Example:

```json
{
  "type": "ASSERT_DECISION",
  "decisionSelector": {
    "decisionDefinitionId": "ChooseRocket"
  },
  "output": {
    "rocket": "Ariane 6"
  },
  "matchedRules": [3]
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
