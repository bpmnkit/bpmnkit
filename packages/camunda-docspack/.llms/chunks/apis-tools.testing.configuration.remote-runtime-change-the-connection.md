# Configuration — Remote runtime — Change the connection

By default, CPT connects to a remote Camunda 8 Run running on your local machine. CPT checks if the remote runtime is
available and ready, before running the tests. It waits up to 1 minute for the remote runtime to become ready.

You can change the connection to the remote runtime and the connection time in the following way.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    runtime-mode: remote
    # Change the connection (default: Camunda 8 Run)
    remote:
      camunda-monitoring-api-address: http://0.0.0.0:9600
      connectors-rest-api-address: http://0.0.0.0:8086
      # The connection timeout in ISO-8601 duration format (default: PT1M)
      runtime-connection-timeout: PT1M
  client:
    rest-address: http://0.0.0.0:8080
    grpc-address: http://0.0.0.0:26500
```

**Note**
The properties `camunda.process-test.remote.client.rest-address` and `camunda.process-test.remote.client.grpc-address` are deprecated. Use `camunda.client.rest-address` and `camunda.client.grpc-address` instead.

In your `/camunda-container-runtime.properties` file:

```properties
runtimeMode=remote
# Change the connection (default: Camunda 8 Run)
remote.camundaMonitoringApiAddress=http://0.0.0.0:9600
remote.connectorsRestApiAddress=http://0.0.0.0:8086
camunda.client.gateway.grpc.address=http://0.0.0.0:26500
camunda.client.gateway.rest.address=http://0.0.0.0:8080
# The connection timeout in ISO-8601 duration format (default: PT1M)
remote.runtimeConnectionTimeout=PT1M
```

**Note**
The properties `remote.client.grpcAddress` and `remote.client.restAddress` are deprecated. Use `camunda.client.gateway.grpc.address` and `camunda.client.gateway.rest.address` instead.

Alternatively, register the JUnit extension manually and use the fluent builder:

```java
package com.example;

import io.camunda.process.test.api.CamundaProcessTestExtension;
import org.junit.jupiter.api.extension.RegisterExtension;

// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
            new CamundaProcessTestExtension()
                    .withRuntimeMode(CamundaProcessTestRuntimeMode.REMOTE)
                    // Change the connection (default: Camunda 8 Run)
                    .withCamundaClientBuilderFactory(() -> CamundaClient.newClientBuilder()
                            .restAddress(URI.create("http://0.0.0.0:8080"))
                            .grpcAddress(URI.create("http://0.0.0.0:26500"))
                    )
                    .withRemoteCamundaMonitoringApiAddress(URI.create("http://0.0.0.0:9600"))
                    .withRemoteConnectorsRestApiAddress(URI.create("http://0.0.0.0:8086"))
                    // Change the connection timeout (default: PT1M)
                    .withRemoteRuntimeConnectionTimeout(Duration.ofMinutes(1));
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
