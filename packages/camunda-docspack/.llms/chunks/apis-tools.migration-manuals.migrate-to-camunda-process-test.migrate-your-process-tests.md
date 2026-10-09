# Migrate to Camunda Process Test — Migrate your process tests

Now, it's time to migrate your process tests.

First, migrate the general test class structure:

1. **Replace annotations and types**
   - Replace `@ZeebeSpringTest` with `@CamundaSpringProcessTest`
   - Replace the type `ZeebeTestEngine` with `CamundaProcessTestContext`

2. **Remove record stream fields**  
   CPT does not provide direct access to records. Instead, use the SDK to request data from the [API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

Below is an example of a ZPT test class:

```java
import io.camunda.zeebe.process.test.extension.testcontainer.ZeebeProcessTest;

@SpringBootTest
@ZeebeSpringTest
class MyProcessTest {

    @Autowired private CamundaClient client;
    @Autowired private ZeebeTestEngine engine;
    @Autowired private RecordStream recordStream;

    @Test
    void shouldCompleteProcess() {
      // given
      final ProcessInstanceEvent processInstance = client
              .newCreateInstanceCommand()
              .bpmnProcessId("my-process")
              .latestVersion()
              .send()
              .join();

      // when: drive the process forward

      // then
      BpmnAssert.assertThat(processInstance)
              .hasPassedElementsInOrder("start", "task1", "task2", "task3", "end")
              .isCompleted();
    }

}
```

This is the equivalent CPT test class:

```java
import io.camunda.process.test.api.CamundaAssert;
import io.camunda.process.test.api.CamundaProcessTestContext;
import io.camunda.process.test.api.CamundaSpringProcessTest;

@SpringBootTest
@CamundaSpringProcessTest
class MyProcessTest {

    @Autowired private CamundaClient client;
    @Autowired private CamundaProcessTestContext processTestContext;

    @Test
    void shouldCompleteProcess() {
      // given
      final ProcessInstanceEvent processInstance = client
              .newCreateInstanceCommand()
              .bpmnProcessId("my-process")
              .latestVersion()
              .send()
              .join();

      // when: drive the process forward

      // then
      CamundaAssert.assertThat(processInstance)
              .hasCompletedElementsInOrder("start", "task1", "task2", "task3", "end")
              .isCompleted();
    }

}
```

First, migrate the general test class structure:

1. **Replace annotations and types**
   - Replace `@ZeebeProcessTest` with `@CamundaProcessTest`
   - Replace the type `ZeebeTestEngine` with `CamundaProcessTestContext`

2. **Remove record stream fields**  
   CPT does not provide direct access to records. Instead, use the SDK to request data from the [API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

Below is an example of a ZPT test class:

```java
import io.camunda.zeebe.process.test.extension.testcontainer.ZeebeProcessTest;

@ZeebeProcessTest
class MyProcessTest {

    private CamundaClient client;
    private ZeebeTestEngine engine;
    private RecordStream recordStream;

    @Test
    void shouldCompleteProcess() {
      // given: the processes are deployed
      final ProcessInstanceEvent processInstance = client
              .newCreateInstanceCommand()
              .bpmnProcessId("my-process")
              .latestVersion()
              .send()
              .join();

      // when: drive the process forward

      // then
      BpmnAssert.assertThat(processInstance)
              .hasPassedElementsInOrder("start", "task1", "task2", "task3", "end")
              .isCompleted();
    }
}
```

This is the equivalent CPT test class:

```java
import io.camunda.process.test.api.CamundaAssert;
import io.camunda.process.test.api.CamundaProcessTest;
import io.camunda.process.test.api.CamundaProcessTestContext;

@CamundaProcessTest
class MyProcessTest {

    private CamundaClient client;
    private CamundaProcessTestContext processTestContext;

    @Test
    void shouldCompleteProcess() {
      // given: the processes are deployed
      final ProcessInstanceEvent processInstance = client
              .newCreateInstanceCommand()
              .bpmnProcessId("my-process")
              .latestVersion()
              .send()
              .join();

      // when: drive the process forward

      // then
      CamundaAssert.assertThat(processInstance)
              .hasCompletedElementsInOrder("start", "task1", "task2", "task3", "end")
              .isCompleted();
    }
}
```

Then, review all test methods and migrate the assertions and utilities. See the following sections for detailed
instructions.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
