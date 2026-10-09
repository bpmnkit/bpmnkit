# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — keycloak

```java
private static final String clientId = "<YOUR_CLIENT_ID>";
private static final String clientSecret = "<YOUR_CLIENT_SECRET>";
private static final String authorizationServer = "https://<KEYCLOAK_HOST>/realms/<REALM_NAME>/protocol/openid-connect/token";
private static final String audience = "<YOUR_CLIENT_ID>";
private static final String ocAudience = "<YOUR_CLIENT_ID>";
private static final String clusterGrpcLocal = "grpc://localhost:26500";
private static final String clusterRestLocal = "http://localhost:8080";
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
