# Client authorization — Client — Custom Credentials provider

As previously mentioned, the `CredentialProvider`'s purpose is to modify the HTTP headers with an authorization method.

The interface consists of an `applyCredentials(CredentialsApplier)` method and a `shouldRetryRequest(StatusCode)` method.

- `applyCredentials(CredentialsApplier)`: Called on every request (both REST and gRPC). The applier lets you add any headers to the request before it's sent.
- `shouldRetryRequest(StatusCode)`: Called every time a request completed with a non-successful status code. The `StatusCode` argument lets you inspect the raw HTTP or gRPC code, and provides a convenient method to check the request had wrong credentials (`StatusCode#isUnauthorized`).

The following sections implement custom provider in Java:

#### Java

```java
public class MyCredentialsProvider implements CredentialsProvider {
    /**
     * Logs in as demo:demo
     */
    @Override
    public void applyCredentials(final CredentialsApplier applier) {
      applier.put("Authorization", "Basic ZGVtbzpkZW1vCg==");
    }

    @Override
    public boolean shouldRetryRequest(final StatusCode status) {
      return status.isUnauthorized();
    }
}
```

After implementing the `CredentialsProvider`, we can provide it when building a client:

```java
public class SecureClient {
    public static void main(final String[] args) {
      final CamundaClient client = CamundaClient.newClientBuilder().credentialsProvider(new MyCredentialsProvider()).build();

      // continue...
    }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/client-authorization
