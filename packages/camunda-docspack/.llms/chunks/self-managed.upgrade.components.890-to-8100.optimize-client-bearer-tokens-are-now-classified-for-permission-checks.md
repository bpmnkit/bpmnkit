# Upgrade Camunda components from 8.9 to 8.10 — Optimize — Client bearer tokens are now classified for permission checks

Optimize now classifies each bearer token as belonging to a user or a machine-to-machine (M2M) client, using `camunda.security.authentication.oidc.username-claim` and `client-id-claim`, and enforces your configured Optimize permission only on tokens it classifies as a user's.

A token Optimize can't classify as an M2M client's is treated as belonging to a user, and checked against your configured Optimize permission.

The Camunda Helm chart doesn't configure either claim for Optimize. `username-claim` keeps its software default of `sub`, and `client-id-claim` has no default at all, so Optimize can't classify any client token as M2M until you set it — every bearer token is checked against your configured Optimize permission. Set both claims through `optimize.extraConfiguration`, matching the values your identity provider uses (for example, `preferred_username` and `client_id` for Keycloak; see the [setup instructions for your identity provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index) for other providers):

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

**Action:** Set `username-claim` and `client-id-claim` to match your identity provider before upgrading. Otherwise, M2M clients without an Optimize permission may see new permission errors after upgrading.

[Optimize authentication in Self-Managed](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize#configure-oidc-for-optimize)

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
