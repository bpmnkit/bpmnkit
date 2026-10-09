# Connector SDK — Creating a custom connector — Outbound connector runtime logic

The connector implements the `OutboundConnectorProvider` interface of the SDK. This allows the Connector runtime to
discover and invoke your Connector. It introspects the `@OutboundConnector` annotation and uses the `type` to register the Connector as a job worker to fetch jobs.

A Connector implementation can now declare

```java
package io.camunda.example;

import io.camunda.connector.api.annotation.Header;
import io.camunda.connector.api.annotation.Operation;
import io.camunda.connector.api.annotation.OutboundConnector;
import io.camunda.connector.api.annotation.Variable;
import io.camunda.connector.api.error.ConnectorException;
import io.camunda.connector.api.outbound.OutboundConnectorProvider;
import jakarta.validation.constraints.NotNull;

@OutboundConnector( // (1)
  name = "MyConnector",
  type = "io.camunda:my-connector:1"
)
@ElementTemplate( // (2)
  id = "my-connector-template:1",
  name = "My Connector Template"
)
public class MyConnector implements OutboundConnectorProvider {

  @Operation(id = "operation1") // (3)
  public String operation1(@Variable(name = "input") String input) { // (4)
    System.out.println("Received input: " + input);
    return "Test operation executed successfully!";
  }

  public record MyInput(@NotNull Integer a, @NotNull int b) {}

  public record MyOutput(int result) {}

  @Operation(id = "operation2")
  public MyOutput operation2(@Variable MyInput input) { // (5)
    return new MyOutput(input.a() + input.b());
  }

  @Operation(id = "operation3")
  public String operation3(@Header(name = "name") String name) { // (6)
    System.out.println("Received name: " + name);
    return name;
  }

  @Operation(id = "operation4")
  public String operation4() {
    throw new ConnectorException(("MY_ERROR"), "This is a test exception"); // (7)
  }
}
```

A single `@OutboundConnector` annotated connector (**(1)**) can declare one or multiple operations. The element template generation can be configured using the `@ElementTemplate` annotation (**(2)**)

Every declared operation (**(3)**) can accept one or multiple inputs as parameters.

Describe each operation with the `name`, `description`, and `keywords` attributes of `@Operation`. The element template generator turns them into the template's [`steps` and `presets`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#predefined-configurations-steps-and-presets), so users can find the operation by searching for the action it performs and select it directly when they apply the template. Once a connector declares more than one operation, every operation must declare at least one keyword, or template generation fails.

Using the `@Variable` annotation, a primitive type has to specify the variable name for example `input` as shown in (**(4)**). Binding to a complex type will use the property names (`a`, `b`) of the type for variable mapping (**(5)**).

Types can use [Jakarta Validation](https://beanvalidation.org/) annotations. Validation will be applied during binding.

It's also possible to bind job headers using the `@Header` annotation (**(6)**) but this is only recommended for static config data defined at modeling time.

If the connector handles exceptional cases, it can use any exception to express technical errors. If a technical
error should be associated with a specific error code, the connector can throw a `ConnectorException` and define
a `code` as shown in **(7)**.

We recommend documenting the list of error codes as part of the connector's API. Users can build on those codes
by creating [BPMN errors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#bpmn-errors-and-failing-jobs) in their connector configurations.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
