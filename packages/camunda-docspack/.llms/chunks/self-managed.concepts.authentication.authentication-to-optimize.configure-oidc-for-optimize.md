# Optimize authentication in Self-Managed — Configure OIDC for Optimize

Set the following properties, shared with the other Camunda components:

- `camunda.security.authentication.oidc.issuer-uri`
- `camunda.security.authentication.oidc.client-id`
- `camunda.security.authentication.oidc.client-secret`
- `camunda.security.authentication.oidc.audiences`
- `camunda.security.authentication.oidc.username-claim`
- `camunda.security.authentication.oidc.client-id-claim`

See the [OIDC configuration properties reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecurityauthenticationoidc) for the full list and defaults.

Note the following:

- `issuer-uri` must match the issuer your IdP puts in the `id_token`.
- `audiences` must contain every audience your IdP issues for Optimize, plus the audience of any other application that calls Optimize on a user's behalf, such as Camunda Hub. See [component-specific configuration keys](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#component-specific-security-configuration-keys-are-deprecated) for the audiences the component-specific keys covered.
- Optimize classifies each bearer token as belonging to a user or a machine-to-machine (M2M) client, using `username-claim` and `client-id-claim`, and enforces your configured Optimize permission only on tokens it classifies as a user's. A token it can't classify as an M2M client's is treated as a user's, and checked against your configured Optimize permission.

**Note**
If you deploy with the Camunda Helm chart, you don't need to set `issuer-uri`, `client-id`, `client-secret`, or `audiences` directly. The chart continues to read the same `global.identity.auth.optimize.*` values you already use, and renders them into the properties above for you.

The chart doesn't set `username-claim` or `client-id-claim` for Optimize. Left unset, `username-claim` falls back to its software default of `sub`, and `client-id-claim` has no default at all, so Optimize can't classify any client token as M2M until you set it — every bearer token is then checked against your configured Optimize permission. Set both explicitly through `optimize.extraConfiguration`, matching the values your identity provider uses (for example, `preferred_username` and `client_id` for Keycloak). See the [setup instructions for your identity provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index) for other providers:

```yaml
optimize:
  extraConfiguration:
    - file: security.yaml
      content: |
        camunda:
          security:
            authentication:
              oidc:
                username-claim: preferred_username
                client-id-claim: client_id
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize
