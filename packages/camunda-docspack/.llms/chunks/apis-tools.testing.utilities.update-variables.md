# Utilities — Update variables

You can update or create variables of a process instance or in the local scope of a BPMN element, for example, to trigger a BPMN conditional event.

To target local variables of a specific BPMN element, use an [ElementSelector](#element-selector).

### Update process instance variables

Use `updateVariables()` to update or create variables on a process instance.

```java
@Test
void shouldTriggerConditionalEvent() {
    // given: a process instance is waiting at the conditional event

    // when: update the variables to trigger the conditional event
    final Map<String, Object> variables = Map.of(
        "priority", 80,
        "riskLevel", "high"
    );
    processTestContext.updateVariables(
        ProcessInstanceSelectors.byKey(processInstanceKey),
        variables);

    // then: verify that the conditional event is completed
}
```

### Update local variables

Use `updateLocalVariables()` to propagate variables starting from a given element's scope. The variables are updated on the element or the nearest parent scope where they already exist. If a variable doesn't exist in any scope, it's created on the process instance scope.

```java
processTestContext.updateLocalVariables(
    ProcessInstanceSelectors.byKey(processInstanceKey),
    ElementSelectors.byId("sub-process"),
    variables);
```

### Create local variables

Use `createLocalVariables()` to create variables in the local scope of a given element. The variables are created only in the element's scope and are not propagated to parent scopes.

```java
processTestContext.createLocalVariables(
    ProcessInstanceSelectors.byKey(processInstanceKey),
    ElementSelectors.byId("sub-process"),
    variables);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
