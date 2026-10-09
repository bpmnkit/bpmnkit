# Assertions — Element instance assertions

You can verify the element instance states and other properties using `CamundaAssert.assertThat(processInstance)`. Use
the BPMN element ID or a [ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the elements.

### With BPMN element ID

Use the BPMN element ID to identify the elements:

```java
assertThat(processInstance).hasActiveElements("task_A");
```

You can customize how the elements are identified in the [configuration](#element-selector).

### With element selector

Use a [ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the elements:

```java
// by BPMN element ID
assertThat(processInstance).hasActiveElements(ElementSelectors.byId("task_A"));

// by BPMN element name
assertThat(processInstance).hasActiveElements(ElementSelectors.byName("A"));
```

### hasActiveElements

Assert that the given BPMN elements of the process instance are active. The assertion fails if at least one element is completed, terminated, or not entered.

```java
assertThat(processInstance).hasActiveElements("task_A", "task_B");
```

### hasActiveElement

Assert that the BPMN element of the process instance is active the given amount of times. The assertion fails if the element is not active or not exactly the given amount of times.

```java
assertThat(processInstance).hasActiveElement("task_A", 2);
```

### hasActiveElementsExactly

Assert that only the given BPMN elements are active. The assertion fails if at least one element is not active, or other elements are active.

```java
assertThat(processInstance).hasActiveElementsExactly("task_A", "task_B");
```

### hasNoActiveElements

Assert that the given BPMN elements are not active. The assertion fails if at least one element is active.

```java
assertThat(processInstance).hasNoActiveElements("task_A", "task_B");
```

### hasNotActivatedElements

Assert that the given BPMN elements are not activated (i.e. not entered). The assertion fails if at least one element is active, completed, or terminated.

This assertion does not wait for the given activities.

```java
assertThat(processInstance).hasNotActivatedElements("task_A", "task_B");
```

### hasCompletedElements

Assert that the given BPMN elements of the process instance are completed. The assertion fails if at least one element is active, terminated, or not entered.

```java
assertThat(processInstance).hasCompletedElements("task_A", "task_B");
```

### hasCompletedElement

Assert that the BPMN element of the process instance is completed the given amount of times. The assertion fails if the element is not completed or not exactly the given amount of times.

```java
assertThat(processInstance).hasCompletedElement("task_A", 2);
```

### hasCompletedElementsInOrder

Assert that the given BPMN elements are completed in order. Elements that do not match any of the given element IDs are ignored. The assertion fails if at least one of the elements is not completed,
or the order is not correct.

```java
assertThat(processInstance).hasCompletedElementsInOrder("task_A", "task_B");
```

### hasTerminatedElements

Assert that the given BPMN elements of the process instance are terminated. The assertion fails if at least one element is active, completed, or not entered.

```java
assertThat(processInstance).hasTerminatedElements("task_A", "task_B");
```

### hasTerminatedElement

Assert that the BPMN element of the process instance is terminated the given amount of times. The assertion fails if the element is not terminated or not exactly the given amount of times.

```java
assertThat(processInstance).hasTerminatedElement("task_A", 2);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
