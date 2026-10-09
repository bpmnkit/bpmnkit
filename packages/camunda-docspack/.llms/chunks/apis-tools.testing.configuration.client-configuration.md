# Configuration — Client configuration

CPT configures the Camunda client automatically based on the runtime mode. You can customize the client
configuration beyond the connection addresses, for example, to set up authentication.

CPT applies all [Camunda client configurations](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration) from your
`application.yml`. For example, to configure Basic authentication for a remote runtime:

```yaml
camunda:
  client:
    grpc-address: http://localhost:26500
    rest-address: http://localhost:8080
    auth:
      method: basic
      username: demo
      password: demo
```

For full flexibility, provide a `CamundaClientBuilderFactory` bean:

```java

@Bean
public CamundaClientBuilderFactory customClientBuilderFactory() {
    return () ->
            CamundaClient.newClientBuilder()
                    .restAddress(URI.create("http://0.0.0.0:8080"))
                    .grpcAddress(URI.create("http://0.0.0.0:26500"))
                    .credentialsProvider(
                            CredentialsProvider.newBasicAuthCredentialsProviderBuilder()
                                    .username("demo")
                                    .password("demo")
                                    .build());
}
```

In the `camunda-container-runtime.properties` file, you can set any
[`ClientProperties`](https://javadoc.io/doc/io.camunda/camunda-client-java/latest/io/camunda/client/ClientProperties.html).
For example, to configure the connection to a remote runtime:

```properties
camunda.client.gateway.rest.address=http://0.0.0.0:8080
camunda.client.gateway.grpc.address=http://0.0.0.0:26500
```

For more flexibility, use the fluent builder to set a client builder factory:

```java

@RegisterExtension
private static final CamundaProcessTestExtension EXTENSION =
        new CamundaProcessTestExtension()
                .withRuntimeMode(CamundaProcessTestRuntimeMode.REMOTE)
                .withCamundaClientBuilderFactory(
                        () ->
                                CamundaClient.newClientBuilder()
                                        .restAddress(URI.create("http://0.0.0.0:8080"))
                                        .grpcAddress(URI.create("http://0.0.0.0:26500")));
```

To override specific client properties, for example to configure a credential provider, use
`withCamundaClientBuilderOverrides`. This works together with the client builder factory and the configuration file:

```java

@RegisterExtension
private static final CamundaProcessTestExtension EXTENSION =
        new CamundaProcessTestExtension()
                .withCamundaClientBuilderOverrides(
                        camundaClientBuilder ->
                                camundaClientBuilder
                                        .credentialsProvider(
                                                CredentialsProvider.newBasicAuthCredentialsProviderBuilder()
                                                        .username("demo")
                                                        .password("demo")
                                                        .build()));
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
