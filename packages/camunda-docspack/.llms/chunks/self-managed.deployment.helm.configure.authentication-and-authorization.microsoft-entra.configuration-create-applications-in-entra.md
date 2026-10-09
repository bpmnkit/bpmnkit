# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Create applications in Entra

Before configuring Camunda, create the following app registrations that map to Camunda components.

Application type **Web**:

- Management Identity (`<mgmt-identity-app>`)
- Orchestration Cluster (`<oc-app>`)
- Optimize (`<optimize-app>`)
- Web Modeler API (`<web-modeler-api-app>`)

Application type **Single-page application**:

- Console (`<console-app>`)
- Web Modeler UI (`<web-modeler-ui-app>`)

Register these as six separate applications. Camunda uses each application's client ID as that component's audience, so two components sharing a registration also share an audience, and a token issued for one is accepted by the other. Entra issues the same tenant-scoped `iss` claim for every application in your tenant, which makes the audience the only value that distinguishes one component from another.

For **each** of the components above:

1. In the Entra ID admin center, [register the application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).
1. On the application's **Overview** page, note the **Client ID**.
1. In the app registration, [configure a platform](https://learn.microsoft.com/en-gb/entra/identity-platform/quickstart-register-app#configure-platform-settings) that matches the component:
   - **Web**: Management Identity, Orchestration Cluster, Optimize, Web Modeler API
   - **Single-page application**: Console, Web Modeler UI
1. Add the component's redirect URI from [the table below](#redirect-uris-per-camunda-component).

**Note**
   Redirect URIs are an allowlist. Only the URIs you define are permitted as redirection targets after authentication. This ensures that tokens and authorization codes are only sent to approved destinations.

1. For app registrations of type **Web**, [create a new client secret](https://learn.microsoft.com/en-gb/entra/identity-platform/quickstart-register-app?tabs=client-secret#add-credentials), and record the secret **value**. You do not need the secret ID.
1. Enable the Entra `v2.0` API by opening the application's [manifest](https://learn.microsoft.com/en-us/entra/identity-platform/reference-microsoft-graph-app-manifest#configure-the-app-manifest-in-the-microsoft-entra-admin-center) and setting the [`requestedAccessTokenVersion`](https://learn.microsoft.com/en-us/entra/identity-platform/reference-microsoft-graph-app-manifest#api-attribute) property under `api` to `2`:
   ```json
   api: {
     ...
     "requestedAccessTokenVersion": 2,
     ...
   }
   ```
1. In **Token configuration**, [add the optional claim](https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims?tabs=appui) `preferred_username` to **both** the access token and the ID token. Entra labels this claim optional, but Camunda requires it.

   Management Identity reads user claims directly from the access token rather than from a userinfo call. If `preferred_username` is missing from the access token, Management Identity finds no matching claim and grants no roles. The user authenticates successfully, then immediately sees a `403 unauthorized` error, and users appear in Operate and Tasklist with an opaque identifier instead of their name.

   To use a different claim that uniquely identifies your users, see [Configure Management Identity](#configure-management-identity). Whichever claim you choose, add it as an optional claim on both token types, since Entra doesn't include it by default.

#### Redirect URIs per Camunda component

| Component             | Redirect URI for the Entra app registration  | Redirect URI for local deployment                   |
| --------------------- | -------------------------------------------- | --------------------------------------------------- |
| Management Identity   | `<IDENTITY_URL>/auth/login-callback`         | `http://localhost:8084/auth/login-callback`         |
| Orchestration Cluster | `<OC_URL>/sso-callback`                      | `http://localhost:8080/sso-callback`                |
| Optimize              | `<OPTIMIZE_URL>/api/authentication/callback` | `http://localhost:8083/api/authentication/callback` |
| Web Modeler UI        | `<WEB_MODELER_URL>/login-callback`           | `http://localhost:8070/login-callback`              |
| Console               | `<CONSOLE_URL>/`                             | `http://localhost:8087/`                            |

Replace each `*_URL` placeholder with the base URL (in the format `<protocol>://<host/ip>:<port>/<context-path>`) that will be accessible from your users’ browsers.
If you plan to expose the services only on `localhost` (as described later in this guide), you can use the URIs in the local deployment column directly.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
