# JSON test cases — Examples — ASSERT_VARIABLE

An instruction to assert a single variable of a process instance. See the [assertions documentation](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#variable-assertions) for more details.

  
    Property
    Description
    Type
    Required
  
  
    type
    Instruction type, must be "ASSERT_VARIABLE"
    string
    Yes
  
  
    processInstanceSelector
    The selector to identify the process instance.
    ProcessInstanceSelector
    Yes
  
  
    elementSelector
    The selector to identify the element for local variables.
    ElementSelector
    No
  
  
    variableName
    The name of the variable to evaluate.
    string
    Yes
  
  
    satisfiesExpression
    A FEEL expression assertion that must evaluate to true for the given variable.
    string
    No
  
  
    satisfiesJudge
    An LLM judge assertion that evaluates the variable against a semantic expectation.
    JudgeAssertion
    No
  
  
    similarTo
    A semantic similarity assertion that checks the variable value against an expected value using text embeddings.
    SemanticSimilarityAssertion
    No
  

Example:

```json
{
  "type": "ASSERT_VARIABLE",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "variableName": "mission",
  "satisfiesExpression": "mission.status = \"completed\" and list contains(mission.astronauts, \"Zee\")"
}
```

#### Judge Assertion

An LLM-as-judge assertion that evaluates a variable against a semantic expectation.

  
    Property
    Description
    Type
    Required
  
  
    expectation
    The semantic expectation for the variable value.
    string
    Yes
  
  
    threshold
    The score threshold (0.0–1.0) at or above which the assertion passes. Defaults to the threshold configured in the CPT runtime (0.5 if not configured).
    number (0.0–1.0)
    No
  
  
    customPrompt
    A custom prompt for the judge evaluation. Overrides the configured custom prompt.
    string
    No
  
  
    attachDocuments
    When true, resolves Camunda document references in the variable value and attaches their content to the judge. Overrides the configured judge.attach-documents setting. To evaluate attached content, use a multimodal-capable model; otherwise, CPT evaluates only the raw variable JSON.
    boolean
    No
  

Example:

```json
{
  "type": "ASSERT_VARIABLE",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "variableName": "missionSummary",
  "satisfiesJudge": {
    "expectation": "The summary confirms a successful moon landing.",
    "threshold": 0.8
  }
}
```

#### Semantic Similarity Assertion

A semantic similarity assertion that checks a variable value against an expected value using text embeddings.

  
    Property
    Description
    Type
    Required
  
  
    expectedValue
    The expected value the variable should be semantically similar to.
    string
    Yes
  
  
    threshold
    The minimum similarity score (0.0–1.0) for the assertion to pass. Defaults to the threshold configured in the CPT runtime (0.5 if not configured).
    number (0.0–1.0)
    No
  

Example:

```json
{
  "type": "ASSERT_VARIABLE",
  "processInstanceSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "elementSelector": {
    "elementId": "ReviewMissionPlan"
  },
  "variableName": "reviewComment",
  "similarTo": {
    "expectedValue": "The mission plan meets the required standards.",
    "threshold": 0.85
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
