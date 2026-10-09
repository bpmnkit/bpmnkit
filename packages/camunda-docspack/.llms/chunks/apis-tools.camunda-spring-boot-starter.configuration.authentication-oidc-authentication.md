# Configuration — Authentication — OIDC authentication

You can authenticate with the cluster using OpenID Connect (OIDC) with client ID and client secret.

To explicitly activate this method, you can set:

```yaml
camunda:
  client:
    auth:
      method: oidc
```

This authentication method will be implied if you set either `camunda.client.auth.client-id` or `camunda.client.auth.client-secret`.

This will load this preset:

```yaml reference referenceLinkText="Source" title="OIDC authentication"
https://github.com/camunda/camunda/blob/main/clients/camunda-spring-boot-starter/src/main/resources/auth-methods/oidc.yaml
```

**Note**
There are three ways to define the token URL. They're prioritized as follows:

1. Provide the `camunda.client.auth.token-url`.
2. Provide the issuer's well-known configuration URL `camunda.client.auth.well-known-configuration-url`. This extracts the token URL from the `token_url` field in the loaded configuration.
3. Provide the issuer's URL `camunda.client.auth.issuer-url`. This generates the well-known configuration URL and extracts the token URL from the `token_url` field in the loaded configuration.

#### Credentials cache path

By default, the Java client caches OAuth credentials in memory only. To persist credentials across JVM restarts, opt in to a file-based cache by setting `camunda.client.auth.credentials-cache-path` to a writeable file location (directory path and file name):

```yaml
camunda:
  client:
    auth:
      credentials-cache-path: /tmp/credentials
```

When this property is unset or empty, no cache file is created and tokens are fetched fresh after each restart.

#### Custom identity provider security context

Several identity providers, such as Keycloak, support client X.509 authorizers as an alternative to client credentials flow.

As a prerequisite, ensure you have proper KeyStore and TrustStore configured, so that:

- Both the Spring Camunda application and identity provider share the same CA trust certificates.
- Both the Spring Camunda and identity provider own certificates signed by trusted CA.
- Your Spring Camunda application own certificate has proper `Distinguished Name` (DN), e.g.
  `CN=My Camunda Client, OU=Camunda Users, O=Best Company, C=DE`.
- Your application DN registered in the identity provider client authorization details.

Once prerequisites are satisfied, your Spring Camunda application must be configured either via global SSL context, or
with an exclusive context which is documented below.

Refer to your identity provider documentation on how to configure X.509 authentication. For example, [Keycloak](https://www.keycloak.org/server/mutual-tls).

If you require configuring SSL context exclusively for your identity provider, you can use this set of properties:

```yaml
camunda:
  client:
    auth:
      keystore-path: /path/to/keystore.p12
      keystore-password: password
      keystore-key-password: password
      truststore-path: /path/to/truststore.jks
      truststore-password: password
```

- **keystore-path**: Path to client's KeyStore; can be both in JKS or PKCS12 formats
- **keystore-password**: KeyStore password
- **keystore-key-password**: Key material password
- **truststore-path**: Path to client's TrustStore
- **truststore-password**: TrustStore password

When the properties are not specified, the default SSL context is applied. For example, if you configure an application with
`javax.net.ssl.*` or `spring.ssl.*`, the latter is applied. If both `camunda.client.auth.*` and either `javax.net.ssl.*`
or `spring.ssl.*` properties are defined, the `camunda.client.auth.*` takes precedence.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
