# Connect Camunda to any OIDC provider — Handle separate access token and ID token signing keys

Most OIDC providers sign access tokens and ID tokens with the same key, published at the single `jwks_uri` in the discovery document. Some enterprise identity provider deployments sign access tokens with a different key than ID tokens. Camunda validates access tokens on every API request and ID tokens only during the login callback, so if you configure only the discovery document's `jwksUrl`, access token validation fails even though login succeeds.

To check whether this applies to your provider, compare the `jwks_uri` in the discovery document against the JWKS endpoint listed for access tokens (or API and runtime tokens) in your provider's admin console. If both are the same URL, skip this section.

If the URLs differ, configure both endpoints:

- Set `global.identity.auth.jwksUrl` to the **access token** JWKS endpoint. Management Identity validates access tokens using this single URL only, and doesn't call the userinfo endpoint or fall back to any other source.
- Add the same URL as an additional JWKS source for the Orchestration Cluster, which otherwise fetches only the primary JWKS from the discovery document:

  ```yaml
  orchestration:
    env:
      - name: CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ADDITIONALJWKSETURIS_0_
        value: "<access-token-jwks-url>"
  ```

  This setting has no dedicated Helm value. It maps to the Spring Boot list property `camunda.security.authentication.oidc.additionalJwkSetUris`, set through `orchestration.env` using Spring's relaxed-binding convention for list properties: one environment variable per index, with the index surrounded by underscores (`..._0_`, `..._1_`, and so on).

The Orchestration Cluster merges keys from the primary JWKS endpoint and all additional endpoints, then selects whichever key matches the `kid` in the incoming token. Both ID tokens and access tokens then validate correctly, regardless of which key set signed them.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
