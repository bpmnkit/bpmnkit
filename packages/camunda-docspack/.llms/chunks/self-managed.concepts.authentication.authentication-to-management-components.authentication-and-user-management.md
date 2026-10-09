# Management and modeling component authentication in Self-Managed — Authentication and user management

Authentication and user management are handled separately:

| Concern                                                 | Handled by                                                                                                        |
| :------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| Authenticating users and clients                        | The component itself. Optimize uses `camunda.security.authentication.*`, and Camunda Hub uses its own properties. |
| Managing users, groups, roles, tenants, and permissions | [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview)                                   |
| Storing user identities and issuing tokens              | Your Identity Provider (IdP)                                                                                      |

Management Identity is still required for the management and modeling components. For more information, see [manage access and permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview).

For the Camunda Hub authentication settings, see [authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components
