# Migrate to the Camunda Java Client — Protocol and connection: REST vs gRPC selection

Zeebe Java Client used **gRPC by default**. The Camunda Java Client uses **REST by default**. If you want to use gRPC, you need to explicitly set the `grpcAddress` in the client builder and configure `preferRestOverGrpc=false` to make gRPC the default.

To use gRPC, add the following to your client builder:

```java
CamundaClient client = CamundaClient.newClientBuilder()
        .grpcAddress(URI.create("http://localhost:26500"))
        .restAddress(URI.create("http://localhost:8080"))
        .preferRestOverGrpc(false)
    .build();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client
