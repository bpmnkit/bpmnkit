# Special OIDC configuration cases

Learn how to configure OIDC for advanced or unusual scenarios.

This page provides guidance for less common OIDC configuration scenarios.


## Use separate OIDC provider URIs for browser and backend

In some cases, the Orchestration Cluster backend and the user’s browser may need to communicate with the OIDC provider using different URLs.

For example, during the [OIDC authorization code flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow):

- The browser is redirected to the OIDC provider for login.
- Once the user grants consent, the Orchestration Cluster backend exchanges the authorization code for an ID/access token by calling the provider’s token endpoint.

In most environments—such as production or centrally managed OIDC providers—both backend and browser can use the same URL. In that case, configure only the [OIDC issuer property](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecurityauthenticationoidc) `camunda.security.authentication.oidc.issuer-uri`.  
The Orchestration Cluster will then request the provider’s well-known endpoint and resolve the required URIs (e.g., authorization and token endpoints).

However, in some development environments (for example, Docker Compose), the backend and browser may need different URLs:

- The Orchestration Cluster backend might access the OIDC provider through a domain name valid only inside the Docker network.
- The browser may need to use `localhost` with a mapped port.

In these cases, omit the `camunda.security.authentication.oidc.issuer-uri` property and configure the endpoints explicitly.

### yaml

```yaml
camunda.security:
  authentication:
    oidc:
      authorization-uri: http://localhost:18080/protocol/openid-connect/auth
      token-uri: http://<Docker network domain name>:18080/protocol/openid-connect/token
      jwk-set-uri: http://<Docker network domain name>:18080/protocol/openid-connect/certs
      end-session-endpoint-uri: http://<Docker network domain name>:18080/protocol/openid-connect/logout
```

### env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_AUTHORIZATIONURI=http://localhost:18080/protocol/openid-connect/auth
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_TOKENURI=http://<Docker network domain name>:18080/protocol/openid-connect/token
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_JWKSETURI=http://<Docker network domain name>:18080/protocol/openid-connect/certs
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ENDSESSIONENDPOINTURI=http://<Docker network domain name>:18080/protocol/openid-connect/logout
```

The exact property values depend on your OIDC provider and environment.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/special-oidc-cases
