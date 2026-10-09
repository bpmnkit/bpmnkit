# Configuration — Connectivity — Camunda API connection

#### gRPC address

Define the address of the [gRPC API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc) exposed by the [Zeebe Gateway](https://docs.camunda.io/docs/next/reference/glossary#zeebe-gateway):

```yaml
camunda:
  client:
    grpc-address: http://localhost:26500
```

**Note**
You must add the `http://` scheme to the URL to avoid a `java.lang.NullPointerException: target` error.

#### REST address

Define address of the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) exposed by the Zeebe Gateway:

```yaml
camunda:
  client:
    rest-address: http://localhost:8080
```

**Note**
You must add the `http://` scheme to the URL to avoid a `java.lang.NullPointerException: target` error.

#### Prefer REST over gRPC

By default, the Camunda Client will use REST instead of gRPC whenever possible to communicate with the Camunda APIs.

To use the gRPC by default, you can configure this:

```yaml
camunda:
  client:
    prefer-rest-over-grpc: false
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
