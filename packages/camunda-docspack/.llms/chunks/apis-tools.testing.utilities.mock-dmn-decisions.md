# Utilities — Mock DMN decisions

You can mock a DMN decision for a business rule task to simulate its output without evaluating the actual DMN decision.
The mock deploys a dummy DMN decision with the given decision ID that returns the given variables.

When to use it:

- Test the process with the business rule task in isolation from the actual DMN decision
- Simulate different outcomes of a DMN decision
- Mock a non-existing DMN decision

```java
@Test
void shouldMockDmnDecision() {
    // given: mock DMN decision with the decision ID "credit-check-decision"
    final Map<String, Object> variables = Map.of(
        "approved", true,
        "riskLevel", "low",
        "creditLimit", 5000
    );
    processTestContext.mockDmnDecision("credit-check-decision", variables);

    // when: create a process instance
    // then: verify that the process instance completed the business rule task
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
