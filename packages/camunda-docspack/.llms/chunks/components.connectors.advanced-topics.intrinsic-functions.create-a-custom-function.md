# Intrinsic functions — Create a custom function

In **Self-Managed** deployments, you can create custom intrinsic functions by implementing the `IntrinsicFunctionProvider` interface
included with the [Connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk), and registering it in the connector runtime.

- The custom function is implemented as a Java method inside the `IntrinsicFunctionProvider` implementation class.
- The method must be annotated with the `@IntrinsicFunction` annotation. The method arguments are transformed into a list of intrinsic function parameters.

```java
import io.camunda.document.Document;
import io.camunda.intrinsic.IntrinsicFunction;
import io.camunda.intrinsic.IntrinsicFunctionProvider;
import java.util.Base64;

public class MyFunctionProvider implements IntrinsicFunctionProvider {

  @IntrinsicFunction(name = "concat")
  public String execute(String s1, String s2) {
    return s1 + s2;
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/intrinsic-functions
