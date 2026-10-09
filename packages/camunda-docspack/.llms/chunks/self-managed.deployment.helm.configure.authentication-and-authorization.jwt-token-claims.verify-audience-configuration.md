# JWT token claims reference — Verify audience configuration

Each component should have its own resource audience by default. Supported integrations can require a component to accept another component's audience. For the per-component Helm values and exceptions, see [Assign a unique audience to each component](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#assign-a-unique-audience-to-each-component).

1. Decide the audience for the component, and configure your provider to issue it.
2. Decode a test token issued for that component.
3. Confirm the `aud` claim contains the value you configured. If another component accepts the same value, confirm a supported integration requires that trust relationship.

**Warning**
The audience claim is required for token validation.  
Camunda rejects tokens that do not include the expected audience value.

### If the token does not include the expected audience

- Review your OIDC provider’s documentation for configuring token audiences.
- Some providers require explicit audience configuration on the client.
- Keycloak may default to `aud: "account"` and require additional setup. See [External Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims
