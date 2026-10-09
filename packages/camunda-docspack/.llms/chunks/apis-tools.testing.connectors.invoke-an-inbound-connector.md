# Connectors — Invoke an inbound connector

You can retrieve the URL address to invoke an inbound connector in your test from the `CamundaProcessTestContext`.

```java
@SpringBootTest
@CamundaSpringProcessTest
public class MyProcessTest {

    @Autowired private CamundaClient client;
    @Autowired private CamundaProcessTestContext processTestContext;

    @Test
    void shouldInvokeConnector() {
        // given: a process instance waiting at a connector event

        // when
        final String inboundConnectorAddress =
            processTestContext.getConnectorsAddress() + "/inbound/" + CONNECTOR_ID;
        // invoke the connector address, for example, via HTTP request

        // then: verify that the connector event is completed
    }
}
```

```java
@CamundaProcessTest
public class MyProcessTest {

    // to be injected
    private CamundaClient client;
    private CamundaProcessTestContext processTestContext;

    @Test
    void shouldInvokeConnector() {
        // given: a process instance waiting at a connector event

        // when
        final String inboundConnectorAddress =
            processTestContext.getConnectorsAddress() + "/inbound/" + CONNECTOR_ID;
        // invoke the connector address, for example, via HTTP request

        // then: verify that the connector event is completed
    }
}
```

**Tip**
You might need to wrap the invocation of the connector in a retry loop, for example, by using [Awaitility](http://www.awaitility.org/).

There can be a delay between verifying that the connectors event is active and opening the connectors inbound subscription.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/connectors
