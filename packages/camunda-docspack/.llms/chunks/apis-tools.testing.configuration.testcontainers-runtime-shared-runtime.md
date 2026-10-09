# Configuration — Testcontainers runtime — Shared runtime

By default, CPT creates a new runtime for each test class. You can change this behavior and use a shared Testcontainers
runtime for all test classes to speed up the test execution. You can enable the shared runtime in the following way.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    # Switch from a managed to a shared runtime
    runtime-mode: shared
```

All test classes using the shared runtime will use the same runtime configuration. You can't change the runtime
configuration for individual test classes, such as enabling connectors or setting connector secrets. However, you can
switch to a managed runtime for individual test classes and override the runtime configuration.

```java

@SpringBootTest(
        properties = {
                // Use a managed runtime for a different configuration
                "camunda.process-test.runtime-mode=managed",
                "camunda.process-test.connectors-enabled=true",
        }
)
@CamundaSpringProcessTest
public class MyProcessTest {
    //
}
```

In your `/camunda-container-runtime.properties` file:

```properties
# Switch from a managed to a shared runtime
runtimeMode=shared
```

All test classes using the shared runtime will use the same runtime configuration. You can't change the runtime
configuration for individual test classes, such as enabling connectors or setting connector secrets. However, you can
switch to a managed runtime for individual test classes and override the runtime configuration.

```java
package com.example;

import io.camunda.process.test.api.CamundaProcessTestExtension;
import org.junit.jupiter.api.extension.RegisterExtension;

// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
            new CamundaProcessTestExtension()
                    // Use a managed runtime for a different configuration
                    .withRuntimeMode(CamundaProcessTestRuntimeMode.MANAGED)
                    .withConnectorsEnabled(true);
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
