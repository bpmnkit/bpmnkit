# Assertions

Use assertions to verify the process instance state.

The class `CamundaAssert` is the entry point for all assertions. It is based on [AssertJ](https://github.com/assertj/assertj) and [Awaitility](http://www.awaitility.org/).

The assertions follow the style: `assertThat(object_to_test)` + expected property.

Use the assertions by adding the following static import in your test class:

```java
import static io.camunda.process.test.api.CamundaAssert.*;
```

**Info: Assertions are blocking**
Camunda executes BPMN processes asynchronously. For testing, this means that there might be a delay between creating a process instance and reaching the expected state.

The assertions handle the asynchronous behavior and wait until the expected property is fulfilled. Only if the property is not fulfilled within the given time, the assertion fails.

**Tip**
CPT provides the most common assertions. However, if you miss an assertion you can implement a [custom assertion](#custom-assertions) yourself.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/assertions
