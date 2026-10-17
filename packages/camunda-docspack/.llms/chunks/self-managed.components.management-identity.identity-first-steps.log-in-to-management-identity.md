# Get started with Management Identity — Log in to Management Identity

Once Management Identity has successfully started, you can open the **Log in** page and log in to Management Identity.

If you are running the default configuration, you can access the Management Identity interface via the following URLs:

- [Docker Compose full or standalone configuration](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration): `http://localhost:8084/`
- [Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install): Follow your [`port-forward` or Ingress configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/accessing-components-without-ingress)
- [Manual](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install): `http://localhost:8080/`


## Default user

In the default configuration, Management Identity creates a default example user during installation.

You can log in with this example user account using the following credentials:

```text
Username: demo
Password: demo
```

**Tip: Want to create more users?**
Management Identity uses the users managed in Keycloak. To create a user, refer to [Keycloak's documentation on creating a user](https://www.keycloak.org/docs/latest/server_admin/#proc-creating-user_server_administration_guide) for your version of Keycloak.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/identity-first-steps
