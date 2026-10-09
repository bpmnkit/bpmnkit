# Assertions — Variable assertions — hasVariableSatisfies

Assert that the process instance has a variable with a value that satisfies the given requirements. The assertion
transforms the value into the given type. In the consumer, you can use [AssertJ](https://github.com/assertj/assertj) to
verify the value.

The assertion fails if the variable doesn't exist, the value is of a different type, or the value doesn't satisfy the
requirements.

```java
assertThat(processInstance).hasVariableSatisfies("order", Order.class, order -> {
    Assertions.assertThat(order.status()).isEqualTo("approved");
    Assertions.assertThat(order.items())
        .hasSize(3)
        .extracting("name", "quantity")
        .containsExactlyInAnyOrder(
            tuple("Helmet", 1),
            tuple("Flag", 1),
            tuple("Oxygen tank", 3)
        );
});
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
