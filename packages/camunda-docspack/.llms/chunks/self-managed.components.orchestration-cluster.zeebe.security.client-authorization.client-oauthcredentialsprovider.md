# Client authorization — Client — OAuthCredentialsProvider

The `OAuthCredentialsProvider` requires the specification of a client ID and a client secret. These are then used to request an access token from an OAuth 2.0 authorization server through a [client credentials flow](https://tools.ietf.org/html/rfc6749#section-4.4).

By default, the authorization server is the one used by Camunda 8, but any other can be used. Using the access token returned by the authorization server, the `OAuthCredentialsProvider` adds it to the gRPC headers of each request as a bearer token. Requests which fail with due to authentication errors (i.e. HTTP 401 or `UNAUTHENTICATED` gRPC code) are seamlessly retried only if a new access token can be obtained.

#### Java

To use the Zeebe client with Camunda 8, first an `OAuthCredentialsProvider` must be created and configured with the appropriate client credentials. The `audience` should be equivalent to the cluster endpoint without a port number.

```java
public class AuthorizedClient {
    public void main(String[] args) {
        final OAuthCredentialsProvider provider =
          new OAuthCredentialsProviderBuilder()
              .clientId("clientId")
              .clientSecret("clientSecret")
              .audience("cluster.endpoint.com")
              // optional
              .scope("scope")
              .build();

        final CamundaClient client =
            new CamundaClientBuilderImpl()
                .gatewayAddress("cluster.endpoint.com:443")
                .credentialsProvider(provider)
                .build();

        System.out.println(client.newTopologyRequest().send().join().toString());
    }
}
```

For security reasons, client secrets should not be hard coded. Therefore, it's recommended to use environment variables to pass client secrets into Zeebe. See [`ZEEBE_*` environment variables](#environment-variables) for the supported variable names. After setting the environment variables corresponding to the properties set on `OAuthCredentialsProviderBuilder` to the correct values, the following would be equivalent to the previous code:

```java
public class AuthorizedClient {
    public void main(final String[] args) {
        final CamundaClient client =
            new CamundaClientBuilderImpl()
                .gatewayAddress("cluster.endpoint.com:443")
                .build();

        System.out.println(client.newTopologyRequest().send().join().toString());
    }
}
```

The client creates an `OAuthCredentialProvider` with the credentials specified through the environment variables and the audience is extracted from the address specified through the `CamundaClientBuilder`.

**Note**
Zeebe's Java client will not prevent you from adding credentials to requests while using an insecure connection, but you should be aware that doing so will expose your access token by transmitting it in plaintext.

#### Environment variables

Since there are several environment variables that can be used to configure an `OAuthCredentialsProvider`, we list them here along with their uses:

- `ZEEBE_CLIENT_ID` - The client ID used to request an access token from the authorization server.
- `ZEEBE_CLIENT_SECRET` - The client secret used to request an access token from the authorization server.
- `ZEEBE_TOKEN_AUDIENCE` - The audience for which the token should be valid.
- `ZEEBE_TOKEN_SCOPE` - The [OAuth scope](https://oauth.net/2/scope/) which can be set optionally, not sent if left unset.
- `ZEEBE_AUTHORIZATION_SERVER_URL` - The URL of the authorization server from which the access token will be requested (by default, configured for Camunda 8).
- `ZEEBE_CLIENT_CONFIG_PATH` - Optional path to a file used to cache access tokens on disk. When set, tokens are persisted across JVM restarts. When unset (the default), credentials are cached in memory only.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/client-authorization
