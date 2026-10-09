# Camunda manual installation — Connectors — spring

Save the following as `application.yaml` in the same folder as your `connector-runtime-(application|bundle)-x-y-z(-with-dependencies).jar`.

```yaml
server:
  port: 9090

camunda:
  client:
    rest-address: http://localhost:8080
    grpc-address: http://localhost:26500
    mode: selfManaged
    auth:
      method: basic
      username: connectors
      password: connectors
```

  

For more information about the configuration of the Connectors, see [Connectors configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
