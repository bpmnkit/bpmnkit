# Assertions — Configuration

You can configure the behavior of the assertions in the following ways.

### Assertion timeout

By default, assertions wait 10 seconds for the expected property to be fulfilled and wait 100 milliseconds between two attempts. You can change these defaults globally in the configuration or per assertion.

Configure the assertions globally in your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    assertion:
      # Set the assertion timeout to 1 minute
      timeout: PT1M
      # Set the assertion interval to 100 milliseconds
      interval: PT0.1S
```

Configure the assertions globally in your `/camunda-container-runtime.properties` file:

```properties
# Set the assertion timeout to 1 minute
assertion.timeout=PT1M
# Set the assertion interval to 100 milliseconds
assertion.interval=PT0.1S
```

Alternatively, you can configure the assertions within your test class using `CamundaAssert`.

```java
@BeforeAll
static void configureAssertions() {
    // Set the assertion timeout to 1 minute
    CamundaAssert.setAssertionTimeout(Duration.ofMinutes(1));
    // Set the assertion interval to 100 milliseconds
    CamundaAssert.setAssertionInterval(Duration.ofMillis(100));
}
```

You can override the global timeout for an assertion using `withAssertionTimeout()`. The given timeout applies only to subsequent assertions in the calling chain.

```java
assertThat(processInstance)
    .withAssertionTimeout(Duration.ofMinutes(1))
    .isCompleted();
```

### Element selector

By default, the element instance assertions identify the BPMN elements by their ID. You can change
the [ElementSelector](https://docs.camunda.io/docs/next/apis-tools/testing/utilities#element-selector) globally in your test class using `CamundaAssert`.

```java
@BeforeAll
static void configureAssertions() {
    // Identify the BPMN elements by their name
    CamundaAssert.setElementSelector(ElementSelectors::byName);
}
```

### Judge configuration

Override the global [judge configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#judge-configuration) for a single assertion chain using `withJudgeConfig`.

```java
assertThat(processInstance)
    .withJudgeConfig(config -> config.withThreshold(0.9))
    .hasVariableSatisfiesJudge("result", "Contains a valid JSON response with status OK.");
```

### Semantic similarity configuration

Override the global [semantic similarity configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#semantic-similarity-configuration) for a single assertion chain using `withSemanticSimilarityConfig`.

```java
assertThat(processInstance)
    .withSemanticSimilarityConfig(config -> config.withThreshold(0.9))
    .hasVariableSimilarTo("greeting", "Hello, how can I help you today?");
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
