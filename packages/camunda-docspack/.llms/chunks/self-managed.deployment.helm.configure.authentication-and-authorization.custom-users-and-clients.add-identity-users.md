# Helm chart user and client setup for Management Identity — Add Identity users

Create Management Identity users under the `identity.users` list.

Example:

```yaml
identity:
  users:
    - username: foo
      secret:
        existingSecret: foo-secret # Secret containing the user's password
        existingSecretKey: foo-secret-key
      firstName: Foo
      lastName: Bar
      email: foo.bar@camunda.com
      roles:
        - ManagementIdentity # Assign roles to the user
        - Optimize
        - Console
```


## Key points

- OAuth2 clients must include at least one redirect URI.
- Public clients do not require a client secret.
- User roles define permissions across Management Identity components such as Web Modeler, Console, and Optimize.
- All referenced Kubernetes secrets must exist before deploying the Helm chart.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/custom-users-and-clients
