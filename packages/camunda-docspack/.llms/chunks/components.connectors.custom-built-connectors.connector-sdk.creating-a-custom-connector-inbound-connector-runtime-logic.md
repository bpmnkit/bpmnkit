# Connector SDK — Creating a custom connector — Inbound connector runtime logic

To create a reusable runtime behavior for your connector, you are required to implement
and expose an implementation of the `InboundConnectorExecutable` interface of the SDK. The connector runtime
environments will call this function; it handles input data, executes the connector's
business logic. Exception handling is optional since the connector runtime environments handle this as a fallback.

The `InboundConnectorExecutable` interface consists of two methods: `activate` and `deactivate`.
A minimal recommended outline of a connector function implementation looks as follows:

```java
package io.camunda.connector.inbound;

import io.camunda.connector.api.annotation.InboundConnector;
import io.camunda.connector.api.inbound.InboundConnectorContext;
import io.camunda.connector.api.inbound.InboundConnectorExecutable;
import io.camunda.connector.inbound.subscription.MockSubscription;
import io.camunda.connector.inbound.subscription.MockSubscriptionEvent;

@InboundConnector(name = "MYINBOUNDCONNECTOR", type = "io.camunda:mytestinbound:1")
public class MyConnectorExecutable implements InboundConnectorExecutable {

    private MockSubscription subscription;
    private InboundConnectorContext connectorContext;

    @Override
    public void activate(InboundConnectorContext connectorContext) {
        MyConnectorProperties props = connectorContext.bindProperties(MyConnectorProperties.class);

        this.connectorContext = connectorContext;

        subscription = new MockSubscription(
                props.getSender(), props.getMessagesPerMinute(), this::onEvent);
    }

    @Override
    public void deactivate() {
        subscription.stop();
    }

    private void onEvent(MockSubscriptionEvent rawEvent) {
        MyConnectorEvent connectorEvent = new MyConnectorEvent(rawEvent);
        var result = connectorContext.correlateWithResult(connectorEvent);
        handleResult(result);
    }

    private void handleResult(CorrelationResult result) {
      switch (result) {
        case Success ignored -> LOG.debug("Message correlated successfully");
        case Failure failure -> {
          switch (failure.handlingStrategy()) {
            case ForwardErrorToUpstream ignored -> {
              LOG.error("Correlation failed, reason: {}", failure.message());
              // forward error to upstream
            }
            case Ignore ignored -> {
              LOG.debug("Correlation failed but no action required, reason: {}", failure.message());
              // ignore
            }
          }
        }
      }
    }
}
```

The `activate` method is a trigger function to start listening to inbound events. The implementation of this method
has to be asynchronous. Once activated, the inbound connector execution is considered active and running.
From this point, it should use the respective methods of `InboundConnectorContext` to communicate with the connector
runtime (e.g. to correlate the inbound event or signal the interrupt).

The `deactivate` method is just a graceful shutdown hook for inbound connectors.
The implementation must release all resources used by the subscription.

The `onEvent` method is a callback function that is triggered by the subscription whenever a new event is received.
This method is responsible for passing the event to the connector runtime environment for correlation.

The `handleResult` method is a helper method to handle the result of the correlation. The `CorrelationResult` object contains the result of the correlation and the handling strategy. The handling strategy defines how the connector implementation should handle the result.

Depending on the strategy, the connector implementation should either forward the error to the upstream system or ignore it. The handling strategy is derived by the connector runtime based on user configuration.

#### Validation

Validating input data is a common task in connectors. The SDK provides
an out-of-the-box solution for input validation.

A default implementation of the SDK's core validation API is provided in a separate,
optional artifact `connector-validation`. If you want to use validation in your
Connector, add the following dependency to your project:

```xml
<dependency>
  <groupId>io.camunda.connector</groupId>
  <artifactId>connector-validation</artifactId>
  <version>${version.connectors}</version>
</dependency>
```

```yml
implementation "io.camunda.connector:connector-validation:${version.connectors}"
```

Validation is performed automatically when binding variables to parameters.

This instructs the context to prepare a validator that is provided by an implementation
of the `ValidationProvider` interface. The `connector-validation` artifact brings along
such an implementation. It uses the [Jakarta Bean Validation API](https://beanvalidation.org/)
together with [Hibernate Validator](https://hibernate.org/validator/).

For your input object to be validated, you need to annotate the input's
attributes to define your requirements:

```java
package io.camunda.connector;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

public class MyConnectorRequest {

  @NotEmpty private String message;
  @NotNull @Valid private Authentication authentication;
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
