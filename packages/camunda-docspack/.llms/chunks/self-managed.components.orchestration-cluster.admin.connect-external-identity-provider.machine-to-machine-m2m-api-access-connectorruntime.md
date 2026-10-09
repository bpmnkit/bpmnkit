# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — connectorruntime

1. Configure your application.yaml:

```yaml
camunda:
  client:
    mode: self-managed
    auth:
      client-id: <YOUR_CLIENT_ID>
      client-secret: <YOUR_CLIENT_SECRET>
      token-url: <YOUR_AUTHORIZATION_SERVER>
      audience: <YOUR_CLIENT_ID>
      scope: <YOUR_CLIENT_ID_FROM_OC>
    grpc-address: grpc://localhost:26500
    rest-address: http://localhost:8080
```

2. Add the following dependencies to your project:

```xml
<dependency>
    <groupId>io.camunda.connector</groupId>
    <artifactId>spring-boot-starter-camunda-connectors</artifactId>
    <version>${version.connectors}</version>
</dependency>
```

Note: You can run the Connector Runtime simply using Helm or Docker Image.

#### Identity Provider Example Configurations

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
