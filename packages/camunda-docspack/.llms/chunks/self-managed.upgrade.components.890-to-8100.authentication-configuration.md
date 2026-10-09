# Upgrade Camunda components from 8.9 to 8.10 — Authentication configuration

In 8.10, Camunda Hub accepts the same `camunda.security.authentication.oidc.*` configuration as the Orchestration Cluster.

No action is required to upgrade to 8.10. Hub translates its 8.9 authentication settings to the new equivalents at startup, and your existing configuration continues to work. Those 8.9 settings are deprecated, however, and are removed in 8.11, so use the following mapping to migrate before upgrading to 8.11:

| 8.9                                                                                                                                                                     | 8.10                                                  |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `spring.security.oauth2.resourceserver.jwt.issuer-uri`                                                                                                                  | `camunda.security.authentication.oidc.issuer-uri`     |
| `camunda.modeler.oauth2.client-id`                                                                                                                                      | `camunda.security.authentication.oidc.client-id`      |
| `camunda.modeler.oauth2.token.user-id-claim`                                                                                                                            | `camunda.security.authentication.oidc.username-claim` |
| `spring.security.oauth2.resourceserver.jwt.audiences``camunda.modeler.security.jwt.audience.internal-api``camunda.modeler.security.jwt.audience.public-api` | `camunda.security.authentication.oidc.audiences`      |

Note the following:

- The three 8.9 audience settings are merged into the single comma-separated `camunda.security.authentication.oidc.audiences` list.
- If you set both an 8.9 setting and its 8.10 equivalent, the 8.10 setting takes precedence.
- The 8.9 settings are removed in 8.11. Migrate to their 8.10 equivalents before upgrading to 8.11.
- Cross-origin resource sharing (CORS) settings are unchanged. Hub continues to use its own CORS configuration.
- User, group, role, tenant, and permission management is unchanged in 8.10, and is still handled by [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview).
- If you set more than one of the three 8.9 audience properties, set `camunda.security.authentication.oidc.audiences` explicitly so the resulting list is the one you intend.
- `camunda.modeler.oauth2.token.username-claim` is unrelated to this migration: it's Hub's own display-name claim (default `name`), and this table's mapping to `camunda.security.authentication.oidc.username-claim` does not apply to it.

For the full Hub authentication configuration, see [Camunda Hub authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
