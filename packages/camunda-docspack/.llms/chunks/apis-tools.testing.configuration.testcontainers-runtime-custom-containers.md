# Configuration — Testcontainers runtime — Custom containers

You can add custom containers to the managed or shared Testcontainers runtime, for example, to add a database, an MCP
server, or a mock service.

The CPT runtime manages the lifecycle of the custom containers and ensures that they are started before the tests and
stopped after the tests. The custom containers are added to the same network as the Camunda and Connectors containers to
allow communication between the containers.

You can add a custom container in the following way.

Implement a `CamundaProcessTestContainerProvider` bean that creates the custom container.

In this example, we create a WireMock container to mock external HTTP calls in the tests.

```java

@Configuration
public class TestConfig {

    @Bean
    public CamundaProcessTestContainerProvider wireMockProvider() {
        return containerContext -> new WireMockContainer();
    }

    // A WireMock container to mock external HTTP calls in the tests
    private static final class WireMockContainer extends GenericContainer<WireMockContainer> {
        public WireMockContainer() {
            // Configure the Docker image
            super("wiremock/wiremock:3.13.0");
            // Configure the network alias for communication between the containers
            withNetworkAliases("wiremock");
            // Configure the ports to expose
            withExposedPorts(8080);
            // Configure the logger
            withLogConsumer(new Slf4jLogConsumer(LoggerFactory.getLogger("tc.wiremock"), true));
            // Configure the wait strategy to ensure that the container is ready before running the tests
            waitingFor(
                    Wait.forHttp("/__admin/mappings").forPort(8080).withMethod("GET").forStatusCode(200));
            // Custom container-specific configuration
            withCopyFileToContainer(
                    // Copy the WireMock mapping file for the HTTP stubs to the container
                    MountableFile.forClasspathResource("/wiremock/mapping.json"),
                    "/home/wiremock/mappings/mapping.json");
        }
    }
}
```

In the `application.yml` configuration, we use a connector secret to bind the connector task to the WireMock container
using its network alias `wiremock` and the exposed port `8080`.

```yaml
camunda:
  process-test:
    connectors-enabled: true
    connectors-secrets:
      BASE_URL: http://wiremock:8080
```

Implement the `CamundaProcessTestContainerProvider` interface that creates the custom container.

In this example, we create a WireMock container to mock external HTTP calls in the tests.

```java
public class WireMockContainerProvider implements CamundaProcessTestContainerProvider {

    @Override
    public GenericContainer<?> createContainer(final CamundaProcessTestContainerContext containerContext) {
        return new WireMockContainer();
    }

    // A WireMock container to mock external HTTP calls in the tests
    private static final class WireMockContainer extends GenericContainer<WireMockContainer> {
        public WireMockContainer() {
            // Configure the Docker image
            super("wiremock/wiremock:3.13.0");
            // Configure the network alias for communication between the containers
            withNetworkAliases("wiremock");
            // Configure the ports to expose
            withExposedPorts(8080);
            // Configure the logger
            withLogConsumer(new Slf4jLogConsumer(LoggerFactory.getLogger("tc.wiremock"), true));
            // Configure the wait strategy to ensure that the container is ready before running the tests
            waitingFor(
                    Wait.forHttp("/__admin/mappings").forPort(8080).withMethod("GET").forStatusCode(200));
            // Custom container-specific configuration
            withCopyFileToContainer(
                    // Copy the WireMock mapping file for the HTTP stubs to the container
                    MountableFile.forClasspathResource("/wiremock/mapping.json"),
                    "/home/wiremock/mappings/mapping.json");
        }
    }
}
```

Register the container provider using the Java ServiceLoader mechanism by creating a file
`io.camunda.process.test.api.runtime.CamundaProcessTestContainerProvider` in the `src/test/resources/META-INF/services`
directory of your project and adding the fully qualified name of the container provider implementation:

```
com.example.WireMockContainerProvider
```

In the `/camunda-container-runtime.properties` configuration file, we use a connector secret to bind the connector task
to the WireMock container using its network alias `wiremock` and the exposed port `8080`.

```properties
connectorsEnabled=true
connectorsSecrets.BASE_URL=http://wiremock:8080
```

Alternatively, you can register the container provider on the JUnit extension using the fluent builder:

```java
// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
            new CamundaProcessTestExtension()
                    .withContainerProvider(new WireMockContainerProvider())
                    .withConnectorsEnabled(true)
                    .withConnectorsSecret("BASE_URL", "http://wiremock:8080");
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
