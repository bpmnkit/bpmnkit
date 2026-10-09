# Camunda Process Test — Test lifecycle

CPT performs the following actions during the JUnit 5 lifecycle when running a test class:

- `beforeAll` (test methods)
  - Start the test runtime
- `beforeEach` (test method)
  - Inject the `CamundaClient`, the `CamundaProcessTestContext`, and the `TestScenarioRunner`
  - Publish the client created event for the Spring Boot process application to trigger the deployment and start job
    workers
  - Deploy resources defined via `@TestDeployment`
- `afterEach` (test method)
  - Collect the data for the coverage report
  - Print the created process instances if the test failed
  - Close the client connections
  - Publish the client closed event for the Spring Boot process application to stop job workers
  - Reset the Camunda runtime clock (can be disabled in the [configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#test-cleanup-settings))
  - Delete all data in the Camunda runtime (can be disabled in the [configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#test-cleanup-settings))
- `afterAll` (test methods)
  - Generate the coverage report
  - Stop the test runtime

### Limitations

CPT doesn't support Spring Boot process applications with `@PostConstruct` methods or a `CommandLineRunner`
implementation. These methods are executed when the test class is initialized, but not before each test method.

We recommend to use a minimal configuration for the test instead of the Spring Boot process application and invoke the
`@PostConstruct` or `run()` methods manually before each test method.

```java
@SpringBootTest(classes = {TestProcessApplication.class})
@CamundaSpringProcessTest
public class ProcessTest {

  @Autowired private CamundaClient client;

  @BeforeEach
  void invokeProcessApplication() throws Exception {
    final Application springBootApplication = new Application();
    springBootApplication.setCamundaClient(client);
    // call the @PostConstruct methods
    springBootApplication.afterStarted();
    // call the CommandLineRunner method
    springBootApplication.run();
  }

}
```

Minimal test configuration:

```java
// must be in a different package than the Spring Boot application
package org.example.test;

@SpringBootApplication(
  // list all required packages for the process test, such as job workers
  scanBasePackages = {"org.example.services", "org.example.workers"}
)
@Deployment(resources = "classpath*:/bpmn/**/*.bpmn")
public class TestProcessApplication {}
```

- `beforeAll` (test methods)
  - Start the test runtime
- `beforeEach` (test method)
  - Inject the `CamundaClient`, the `CamundaProcessTestContext`, and the `TestScenarioRunner`
  - Deploy resources defined via `@TestDeployment`
- `afterEach` (test method)
  - Collect the data for the coverage report
  - Print the created process instances if the test failed
  - Close the client connections
  - Reset the Camunda runtime clock (can be disabled in the [configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#test-cleanup-settings))
  - Delete all data in the Camunda runtime (can be disabled in the [configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#test-cleanup-settings))
- `afterAll` (test methods)
  - Generate the coverage report
  - Stop the test runtime

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/getting-started
