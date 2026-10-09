# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — camundaclient

1) Add the dependency to your Java Project:

```xml
<dependency>
    <groupId>io.camunda</groupId>
    <artifactId>camunda-client-java</artifactId>
    <version>8.8.x</version>
</dependency>
```

2. Update your Java code to configure and verify authentication:

```java
   private static final String clientId = "<YOUR_CLIENT_ID>";
   private static final String clientSecret = "<YOUR_CLIENT_SECRET>";
   private static final String authorizationServer = "<YOUR_AUTHORIZATION_SERVER>";
   private static final String audience = "<YOUR_CLIENT_ID>";
   private static final String ocAudience = "<YOUR_CLIENT_ID_FROM_OC>";
   private static final String clusterGrpcLocal = "grpc://localhost:26500";
   private static final String clusterRestLocal = "http://localhost:8080";

  // Build a new OAuthCredentialsProvider
  final OAuthCredentialsProvider credentialsProvider =
        new OAuthCredentialsProviderBuilder()
          .authorizationServerUrl(authorizationServer)
          .audience(audience)
          .clientId(clientId)
          .clientSecret(clientSecret)
          .scope(ocAudience) // for Microsoft EntraID typically use: ocAudience + "/.default"
          .build();
  // Build a new Camunda Client with the CredentialsProvider
   try (CamundaClient client = CamundaClient.newClientBuilder()
            .grpcAddress(URI.create(clusterGrpcLocal))
            .restAddress(URI.create(clusterRestLocal))
            .credentialsProvider(credentialsProvider)
            .build()) {
      // Send a topology request to verify authentication
      Topology t = client.newTopologyRequest().send().join();
      System.out.println(t.toString());

      }
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
