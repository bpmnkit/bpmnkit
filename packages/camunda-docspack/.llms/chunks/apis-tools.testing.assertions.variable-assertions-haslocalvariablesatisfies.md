# Assertions — Variable assertions — hasLocalVariableSatisfies

Assert that the process instance has a local variable in the scope of the given element with a value that satisfies the
given requirements. Use the BPMN element ID or a [ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) to identify the
element. The assertion transforms the value into the given type. In the consumer, you can
use [AssertJ](https://github.com/assertj/assertj) to verify the value.

The assertion fails if the variable doesn't exist, the value is of a different type, or the value doesn't satisfy the
requirements.

```java
assertThat(processInstance).hasLocalVariableSatisfies(
    ElementSelectors.byId("send-email"),
    "to",
    EmailTo.class,
    emailTo -> {
        Assertions.assertThat(emailTo.name()).isEqualTo("Zee");
        Assertions.assertThat(emailTo.email()).isEqualTo("zee@camunda.com");
    });
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
