# Connect Admin to an identity provider — Redirect URI

Use the redirect URI to define where the Identity Provider (IdP) sends users back after successful authentication.

By default, the redirect URI is:

`{baseUrl}/sso-callback`

At runtime, `{baseUrl}` resolves to the URL used to access your Orchestration Cluster deployment. In most cases, you do not need to change this value.

You may need to customize the redirect URI in advanced scenarios, such as:

- When your deployment is accessed through reverse proxies or load balancers
- When you need to pass context information while configuring multiple OIDC providers

Regardless of customization, the redirect URI must always point to the `/sso-callback` endpoint of your Orchestration Cluster deployment.

The Orchestration Cluster checks the redirect URI at startup and writes a warning if the value cannot expand to a usable callback URL. It still starts. A usable value:

- Starts with `{baseUrl}`, or has an `https` or `http` scheme and a host
- Has a port between 1 and 65535, if it has a port
- Has a callback path
- Has no fragment (`#`)

A value with no callback path, or with a path that has no leading slash, falls back to `{baseUrl}/sso-callback`, and the login completes. Any other unusable value stays as configured, so the login fails when the browser returns from the IdP.

The cluster serves the callback at the path that the redirect URI resolves to. The path must be one that the cluster routes to its web applications, and `/sso-callback` is the path that the cluster keeps for this purpose. A path outside that set passes the startup check, but the callback request does not reach the cluster's login handling, and the login does not complete.

The default value `{baseUrl}/sso-callback` is correct. The cluster also checks the redirect URI if you only use API clients, which never use the redirect URI.

Most Identity Providers require you to explicitly configure allowed redirect URIs for security reasons. Ensure the value configured in your IdP exactly matches the redirect URI used here, whether it is static or dynamically resolved using `{baseUrl}`.

**Note**

`{baseUrl}` is dynamically resolved for each request based on the URL used to access the Orchestration Cluster instance. It is composed of the following parts:

- `{scheme}`: The transport scheme (`http` or `https`)
- `{host}`: The hostname used to connect to the instance
- `{port}`: The port number, if specified (omitted if not used)
- `{contextPath}`: The context path of the Orchestration Cluster instance, if configured (omitted if none)

For example:

- Accessing the instance via `https://camunda.acme.com/identity` resolves `{baseUrl}` to `https://camunda.acme.com`
- Accessing the instance via `https://services.acme.com:18080/camunda/` resolves `{baseUrl}` to `https://services.acme.com:18080/camunda`

- **Username claim**: By default, the `sub` (subject) claim from the token is used as the username. If you want to use a different claim (such as `preferred_username` or `email`), ensure your IdP includes it in the token and set the `username-claim` property accordingly. You can use a [JSONPath expression](https://www.rfc-editor.org/rfc/rfc9535.html) to locate the username claim in the token (for example, `$['camundaorg']['username']`).

**Info**
If you're using Camunda Hub and want to allow deployments to the Orchestration Cluster from there (with the [`BEARER_TOKEN` authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#available-authentication-methods)),
both applications must use the same IdP. You also need to make the cluster accept the token passed by Camunda Hub.
To do so, include the Camunda Hub UI's token audience in the configured list of audiences.

#### Example IdP configuration

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
