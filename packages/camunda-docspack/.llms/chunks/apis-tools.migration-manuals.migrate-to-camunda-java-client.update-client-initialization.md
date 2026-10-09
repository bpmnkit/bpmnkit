# Migrate to the Camunda Java Client — Update client initialization

Update the client initialization code to use the new `CamundaClient` class.

For example, change:

```java
ZeebeClient client = ZeebeClient.newClientBuilder()
    .gatewayAddress("localhost:26500")
    .usePlaintext()
    .build();
```

to:

```java
CamundaClient client = CamundaClient.newClientBuilder()
    .grpcAddress(URI.create("http://localhost:26500"))
    .restAddress(URI.create("http://localhost:8080"))
    .build();
```

**Info**

- Refer to the [CamundaClientBuilder documentation](https://javadoc.io/doc/io.camunda/camunda-client-java/latest/io/camunda/client/CamundaClientBuilder.html) for more details on available configuration options.
- The construction for OAuth, Basic Auth, or custom providers remains conceptually the same, but you must ensure you use the classes from the new package. Refer to the [Camunda Java Client bootstrapping](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started#bootstrapping) for more details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client
