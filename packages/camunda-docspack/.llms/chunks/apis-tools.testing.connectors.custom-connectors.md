# Connectors — Custom connectors

By default, the runtime uses the built-in connectors bundle in the same version as the Maven module. You can change the
version or use a custom connectors bundle in the following way.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    connectors-enabled: true
    connectors-docker-image-name: my-org/my-connectors
    connectors-docker-image-version: 1.0.0
```

In your `/camunda-container-runtime.properties` file:

```properties
connectorsEnabled=true

connectorsDockerImageName=my-org/my-connectors
connectorsDockerImageVersion=1.0.0
```

Or, via JUnit extension:

```java
// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
        new CamundaProcessTestExtension()
            .withConnectorsEnabled(true)
            .withConnectorsDockerImageName("my-org/my-connectors")
            .withConnectorsDockerImageVersion("1.0.0");
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/connectors
