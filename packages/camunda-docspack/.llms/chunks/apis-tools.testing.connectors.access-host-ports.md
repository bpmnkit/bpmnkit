# Connectors — Access host ports

By default, the connectors run inside the Testcontainers environment in isolation and can't access your local machine.
However, you can
expose [host ports](https://java.testcontainers.org/features/networking/#exposing-host-ports-to-the-container) to the
containers, for example, to invoke a mock HTTP server running on your local machine from an outbound REST connector.

Expose the host ports using `TestContainers.exposeHostPorts(port)`. Inside the container, the local machine is available
under the hostname `host.testcontainers.internal`.

```java
@WireMockTest(httpPort = 9999)
@SpringBootTest(
    properties = {
        "camunda.process-test.connectors-enabled=true",
        "camunda.process-test.connectors-secrets.BASE_URL=http://host.testcontainers.internal:9999"
    })
@CamundaSpringProcessTest
public class MyProcessTest {

    @Autowired private CamundaClient client;

    @BeforeAll
    static void setup() {
        Testcontainers.exposeHostPorts(9999);
    }

    @Test
    void shouldInvokeUrlFromConnector() {
        // given: stub the HTTP server
        stubFor(
            get(urlPathMatching("/test"))
                .willReturn(
                    aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody("{\"status\":\"okay\"}")));

        // when: a process instance invoked the outbound connector

        // then: verify the HTTP request
        CamundaAssert.assertThat(processInstance)
            .isCompleted()
            .hasVariable("status", "okay");

        verify(getRequestedFor(urlEqualTo("/test")));
    }
}
```

```java
@WireMockTest(httpPort = 9999)
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
        new CamundaProcessTestExtension()
            .withConnectorsEnabled(true)
            .withConnectorsSecret("BASE_URL", "http://host.testcontainers.internal:9999");

    private CamundaClient client;

    @BeforeAll
    static void setup() {
        Testcontainers.exposeHostPorts(9999);
    }

    @Test
    void shouldInvokeUrlFromConnector() {
        // given: stub the HTTP server
        stubFor(
            get(urlPathMatching("/test"))
                .willReturn(
                    aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody("{\"status\":\"okay\"}")));

        // when: a process instance invoked the outbound connector

        // then: verify the HTTP request
        CamundaAssert.assertThat(processInstance)
                .isCompleted()
                .hasVariable("status", "okay");

        verify(getRequestedFor(urlEqualTo("/test")));
    }
}
```

**Tip**
You can configure the URL of an outbound connector in your BPMN process
using [Connectors secrets](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets) to replace it in the
tests, for example, setting the URL expression to `"{{secrets.BASE_URL}}" + "/test"`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/connectors
