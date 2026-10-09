# Connectors — Enable connectors

By default, the connectors are disabled. You need to change the configuration in the following way.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    # Enable connectors
    connectors-enabled: true
```

Or, directly on your test class:

```java
@SpringBootTest(properties = {"camunda.process-test.connectors-enabled=true"})
@CamundaSpringProcessTest
public class MyProcessTest {
    //
}
```

In your `/camunda-container-runtime.properties` file:

```properties
# Enable Connectors
connectorsEnabled=true
```

Or, register the JUnit extension manually and use the fluent builder:

```java
// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
        new CamundaProcessTestExtension()
            // Enable Connectors
            .withConnectorsEnabled(true);
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/connectors
