# Camunda Process Test — Write a test

Create a new Java class with the following structure:

```java
package com.example;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.response.ProcessInstanceEvent;
import io.camunda.process.test.api.CamundaAssert;
import io.camunda.process.test.api.CamundaProcessTestContext;
import io.camunda.process.test.api.CamundaSpringProcessTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@CamundaSpringProcessTest
public class MyProcessTest {

    @Autowired private CamundaClient client;
    @Autowired private CamundaProcessTestContext processTestContext;

    @Test
    void shouldCreateProcessInstance() {
        // given process definition is deployed

        // when
        final ProcessInstanceEvent processInstance =
            client
                .newCreateInstanceCommand()
                .bpmnProcessId("my-process")
                .latestVersion()
                .send()
                .join();

        // then
        CamundaAssert.assertThat(processInstance).isActive();
    }
}
```

- `@SpringBootTest` is the standard Spring annotation for tests.
- `@CamundaSpringProcessTest` registers the Camunda test execution listener that starts and stops the test runtime.
- `@Test` is the standard JUnit 5 annotation for a test case.
- (_optional_) Inject a preconfigured `CamundaClient` to interact with the Camunda runtime.
- (_optional_) Inject a `CamundaProcessTestContext` to interact with the test runtime.
- (_optional_) Use `CamundaAssert` to verify the process instance state.

The Spring test requires a Spring Boot process application in the same package. Usually, the process
application [deploys the process resources](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#deploy-process-models)
using the annotation `@Deployment`.

If you have no process application yet, you can add a minimal one inside the test class as follows:

```java
@SpringBootApplication
@Deployment(resources = "classpath*:/bpmn/**/*.bpmn")
static class TestProcessApplication {}
```

```java
package com.example;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.response.ProcessInstanceEvent;
import io.camunda.process.test.api.CamundaAssert;
import io.camunda.process.test.api.CamundaProcessTest;
import io.camunda.process.test.api.CamundaProcessTestContext;
import org.junit.jupiter.api.Test;

@CamundaProcessTest
public class MyProcessTest {

    // to be injected
    private CamundaClient client;
    private CamundaProcessTestContext processTestContext;

    @Test
    void shouldCreateProcessInstance() {
        // given
        client
            .newDeployResourceCommand()
            .addResourceFromClasspath("my-process.bpmn")
            .send()
            .join();

        // when
        final ProcessInstanceEvent processInstance =
            client
                .newCreateInstanceCommand()
                .bpmnProcessId("my-process")
                .latestVersion()
                .send()
                .join();

        // then
        CamundaAssert.assertThat(processInstance).isActive();
    }
}
```

- `@CamundaProcessTest` registers the Camunda JUnit extension that starts and stops the test runtime.
- `@Test` is the standard JUnit 5 annotation for a test case.
- (_optional_) Get a preconfigured `CamundaClient` injected to interact with the Camunda runtime.
- (_optional_) Get a `CamundaProcessTestContext` injected to interact with the test runtime.
- (_optional_) Use `CamundaAssert` to verify the process instance state.

**Tip: Shared runtime**
If you use the same runtime configuration for all test classes, you can use
a [shared runtime](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#shared-runtime) to speed up the test execution.

### Deploy resources

You can deploy additional BPMN processes and other resources by adding the annotation `@TestDeployment` on the test
class or the method. An annotation on the test method takes precedence over an annotation on the test class. The
resources are loaded from the root classpath of the test.

```java
@Test
@TestDeployment(resources = "my-process.bpmn")
void shouldCreateProcessInstance() {
  // the given resources are deployed before running the test
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/getting-started
