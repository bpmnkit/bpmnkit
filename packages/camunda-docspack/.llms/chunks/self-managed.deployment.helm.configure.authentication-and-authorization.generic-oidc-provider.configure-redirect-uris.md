# Connect Camunda to any OIDC provider — Configure redirect URIs

For each OIDC client you have created, configure the redirect URIs that correspond to where Camunda components will be accessible from users' browsers.

### Redirect URI table

| Component             | Redirect URI pattern                         | Example (localhost)                                 | Example (Ingress)                                                  |
| --------------------- | -------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| Management Identity   | `<IDENTITY_URL>/auth/login-callback`         | `http://localhost:8084/auth/login-callback`         | `https://camunda.example.com/identity/auth/login-callback`         |
| Orchestration Cluster | `<OC_URL>/sso-callback`                      | `http://localhost:8080/sso-callback`                | `https://camunda.example.com/orchestration/sso-callback`           |
| Optimize              | `<OPTIMIZE_URL>/api/authentication/callback` | `http://localhost:8083/api/authentication/callback` | `https://camunda.example.com/optimize/api/authentication/callback` |
| Web Modeler UI        | `<WEB_MODELER_URL>/login-callback`           | `http://localhost:8070/login-callback`              | `https://camunda.example.com/modeler/login-callback`               |
| Console               | `<CONSOLE_URL>/`                             | `http://localhost:8087/`                            | `https://camunda.example.com/`                                     |

Replace `<*_URL>` with the actual base URL where each component will be accessible. Use the localhost examples if testing locally with port forwarding, or the Ingress examples if exposing components via Ingress.

**Important: Security note**
Redirect URIs are security-critical. Only the URIs you configure in your OIDC provider are permitted as redirection targets after authentication. Ensure these values match the `redirectUrl` parameters you'll set in the Helm configuration.

**Tip: Wildcard support**
Some OIDC providers support wildcard redirect URIs (e.g., `https://camunda.example.com/*`). Check your provider's documentation to see if this can simplify your configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
