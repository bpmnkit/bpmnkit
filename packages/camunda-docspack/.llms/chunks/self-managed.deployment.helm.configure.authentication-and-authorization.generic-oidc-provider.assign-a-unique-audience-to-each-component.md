# Connect Camunda to any OIDC provider — Assign a unique audience to each component

Camunda components can trust tokens from the same OIDC issuer while using the `aud` claim to identify the intended resource. Each component validates this claim against its configured audience and accepts any token that carries it.

Management Identity controls access to Camunda Hub and Optimize. The Orchestration Cluster manages its own roles and authorizations through Admin. Both subsystems can use the same OIDC provider, but their authorization checks remain independent.

Decide a distinct audience for each component before you configure Helm, then configure your provider to issue it.

| Component              | Helm value                                            | Chart default                      |
| ---------------------- | ----------------------------------------------------- | ---------------------------------- |
| Management Identity    | `global.identity.auth.identity.audience`              | `camunda-identity-resource-server` |
| Orchestration Cluster  | `orchestration.security.authentication.oidc.audience` | `orchestration-api`                |
| Optimize               | `global.identity.auth.optimize.audience`              | `optimize-api`                     |
| Web Modeler client API | `global.identity.auth.webModeler.clientApiAudience`   | `web-modeler-api`                  |
| Web Modeler public API | `global.identity.auth.webModeler.publicApiAudience`   | `web-modeler-public-api`           |
| Connectors             | Inherits the Orchestration Cluster audience           | `orchestration-api`                |

**Warning**
If two components accept the same audience, a token intended for one can also pass the other's audience validation. Keep the resource audiences in this table distinct unless a supported integration requires one component to accept another's token.

Do not derive these values by inspecting whatever token your provider returns by default. If several components are registered against one client or API identifier, inspection returns the same `aud` for all of them, so configuring what you find reproduces the collision instead of revealing it. Decide the values first, then use [token inspection](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims) to confirm your provider issues them.

The following integrations intentionally cross this audience boundary:

- Connectors calls the Orchestration Cluster as a client and uses the Orchestration Cluster's audience. See [Configure Connectors](#configure-connectors).
- Camunda Hub deployments that use `BEARER_TOKEN` authentication forward the user's Hub token to the Orchestration Cluster. Configure the cluster to accept the Camunda Hub UI audience in addition to its own audience. See [connect Admin to an identity provider](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-4-configure-the-oidc-connection-details).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
