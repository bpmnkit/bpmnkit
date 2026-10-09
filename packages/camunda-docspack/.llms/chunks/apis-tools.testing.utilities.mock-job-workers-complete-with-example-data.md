# Utilities — Mock job workers — Complete with example data

The mock completes jobs with [example data](https://docs.camunda.io/docs/next/components/modeler/data-handling#defining-example-data) that is defined
at the related BPMN element. If the BPMN element has no example data, the mock completes the job without variables.

```java
@Test
void shouldCompleteJobWithExampleData() {
    // given: mock job worker for the job type "fetch-weather-data"
    processTestContext.mockJobWorker("fetch-weather-data").thenCompleteWithExampleData();

    // when: create a process instance
    // then: verify that the process instance completed all tasks
}
```

**Tip**

Add example data during modeling to provide context and make writing FEEL expressions easier. By using the same example
data for mocks, you keep the data in the BPMN process itself and avoid repeating them in the process tests. This can
simplify your tests and reducing the maintenance effort.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
