# Camunda 8 SaaS — Security and compliance

### Compliance

At Camunda, we're committed to Information Security, Privacy and Compliance. Our mission is to establish trust through transparency.

- Visit the [Camunda Trust Center](https://camunda.com/trust-center/) to learn more about our standards and certifications, including SOC 2 compliance, ISO/IEC 27001 certification, and GDPR Compliance.
- Camunda is a member of the [Cloud Security Alliance](https://cloudsecurityalliance.org/star/registry/camunda/services/camunda).

### Data retention

In Camunda 8 SaaS, [data retention](https://docs.camunda.io/docs/next/components/saas/data-retention) strategies are implemented. This is necessary as the amount of data can grow significantly overtime. These settings are a balance between performance and usability.

### Data locations

See [data locations](https://docs.camunda.io/docs/next/components/saas/data-locations) to learn more about where your Camunda 8 SaaS data is located and how data is handled.

### Access controls

Camunda 8 SaaS supports the following access controls.

| Access control type                                                                               | Description                                                                                                                                                                                                                                      |
| :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Single sign-on (SSO)](https://docs.camunda.io/docs/next/components/hub/organization/manage-organization-settings/external-sso) | SSO is available for both Starter and Enterprise plans, using Identity as a bridge between an OpenID Connect (OIDC) provider and the Camunda platform.                                                                                           |
| [OAuth](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-api-clients)                       | The OAuth service is used to allow client applications to interact with Zeebe in SaaS from the outside. Every client application must authenticate itself using an OAuth Flow.                                                                   |
| [Role based access (RBAC)](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index)                    | Camunda 8 SaaS supports RBAC through a system of roles and permissions.Each role provides a different level of access to Camunda 8 components, allowing organizations to control user permissions based on their responsibilities. |
| [Resource-based authorization](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/resource-based-auth)  | Resource authorizations allow you to control the level of access a user has to a particular resource in the system.                                                                                                                              |

**Note**
In Enterprise plans, the hostname section of the email address for invites can be restricted to meet your internal security policies. To learn more, [contact Camunda support](https://camunda.com/services/support/).

---
Source: https://docs.camunda.io/docs/next/components/saas/saas
