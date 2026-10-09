# Assertions — Decision assertions

You can verify the decision evaluation state and other properties using `CamundaAssert.assertThat()` or
`CamundaAssert.assertThatDecision()`. Use the evaluate decision response or
a [DecisionSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#decision-selector) to identify the decision instance.

### With evaluate decision response

Use the response of the evaluate decision command to identify the decision instance:

```java
// given/when
EvaluateDecisionResponse response =
    client
        .newEvaluateDecisionCommand()
        .decisionId(decisionId)
        .variables(variables)
        .send()
        .join();

// then
assertThat(response).isEvaluated();
```

### With decision selector

Use a [DecisionSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#decision-selector) to identify the decision instance:

```java
// by decision ID
assertThatDecision(DecisionSelectors.byId("decision-id")).isEvaluated();

// by decision name
assertThatDecision(DecisionSelectors.byName("Decision Name")).isEvaluated();

// by process instance key
assertThatDecision(DecisionSelectors.byProcessInstanceKey(processInstanceKey)).isEvaluated();
```

### isEvaluated

Asserts that the decision is evaluated. The assertion fails if the evaluation failed and outputs the evaluation failure message.

```java
assertThatDecision(DecisionSelectors.byId("decision-id")).isEvaluated();
```

### hasOutput

Asserts that the decision is evaluated with the expected output. The verification fails if the decision evaluation failed or the output does not match.

```java
// With primitive value
assertThatDecision(DecisionSelectors.byId("decision-id")).hasOutput("output");

// With a map of values
Map<String, Object> expectedOutput = //
assertThatDecision(DecisionSelectors.byId("decision-id")).hasOutput(expectedOutput);

// With a list of values
List<Object> expectedOutput = //
assertThatDecision(DecisionSelectors.byId("decision-id")).hasOutput(expectedOutput);
```

### hasMatchedRules

Asserts that the decision table has matched the given rule indices. The evaluation fails if the decision evaluation failed or at least one of the expected matched rules didn't match.

The assertion will pass if the expected indexes are a subset of the total matches, e.g. `hasMatchedRules(1, 2)` will pass if rules [1, 2, 3] matched.

```java
// Single rule
assertThatDecision(DecisionSelectors.byId("decision-id")).hasMatchedRules(1);

// Multiple rules
assertThatDecision(DecisionSelectors.byId("decision-id")).hasMatchedRules(1, 3);
```

### hasNotMatchedRules

Asserts that the decision table has not matched the given rule indices. The assertion will fail if the decision evaluation has failed or at least one of the rules indexes has matched.

```java
// Single rule
assertThatDecision(DecisionSelectors.byId("decision-id")).hasNotMatchedRules(2);

// Multiple rules
assertThatDecision(DecisionSelectors.byId("decision-id")).hasNotMatchedRules(2, 4);
```

### hasNoMatchedRules

Asserts that the decision table matched no rules. The assertion will fail if the decision evaluation has failed or at least one rule matched.

```java
assertThatDecision(DecisionSelectors.byId("decision-id")).hasNoMatchedRules();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
