# Connect Camunda to any OIDC provider — Grant access to components

After deployment, you must configure access for the following components.

To grant a user access to the Web Modeler UI:

- [Create a mapping rule in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules#add-a-mapping-rule) for the `Web Modeler` role that matches the user's access token.

To grant a client access to the Web Modeler API:

- [Create a role in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles#add-a-role) for the Web Modeler API.
- [Assign Web Modeler API permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/manage-permissions#manage-role-permissions) to that role in Management Identity.
- [Create a mapping rule in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules#add-a-mapping-rule) for that role that matches the client's access token.

To grant a user access to Optimize:

- [Create a mapping rule in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules#add-a-mapping-rule) for the `Optimize` role that matches the user's access token.

**Info**
When using an OIDC provider, the following Optimize features are not currently available:

- The **User permissions** tab in collections.
- The **Alerts** tab in collections.
- Digests.
- Accessible user names for resource owners (the value of the `sub` claim is displayed instead).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
