# Configuration — Remote runtime — Usage

You need to set the following property to switch to a remote runtime.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    # Switch from a managed to a remote runtime
    runtime-mode: remote
```

In your `/camunda-container-runtime.properties` file:

```properties
# Switch from a managed to a remote runtime
runtimeMode=remote
```

Alternatively, you can register the JUnit extension manually and use the fluent builder:

```java
package com.example;

import io.camunda.process.test.api.CamundaProcessTestExtension;
import org.junit.jupiter.api.extension.RegisterExtension;

// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
            new CamundaProcessTestExtension()
                    // Switch from a managed to a remote runtime
                    .withRuntimeMode(CamundaProcessTestRuntimeMode.REMOTE);
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
