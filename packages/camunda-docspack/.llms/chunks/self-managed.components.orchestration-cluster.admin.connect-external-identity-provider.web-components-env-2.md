# Connect Admin to an identity provider — Web components — env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTID=<YOUR_CLIENTID>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTSECRET=<YOUR_CLIENTSECRET>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ISSUERURI=<YOUR_ISSUERURI>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_REDIRECTURI=<YOUR_REDIRECTURI>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USERNAMECLAIM=<YOUR_USERNAMECLAIM>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_AUDIENCES=<YOUR_CLIENTID>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_SCOPE=["openid"]
```

**Tip**
If your OIDC provider needs to be reached using different URLs from the browser and backend (for example, when running in Docker or behind a reverse proxy), you can configure separate URIs instead of a single `issuer-uri`. See [use separate OIDC provider URIs for browser and backend](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/special-oidc-cases#use-separate-oidc-provider-uris-for-browser-and-backend) for details.

- **Username claim**: By default, the `sub` (subject) claim from the token is used as the username. If you want to use a different claim (such as `preferred_username` or `email`), ensure your IdP includes it in the token and set the `username-claim` property accordingly. You can use a [JSONPath expression](https://www.rfc-editor.org/rfc/rfc9535.html) to locate the username claim in the token (for example, `$['camundaorg']['username']`).

**Info**
If you're using Camunda Hub and want to allow deployments to the Orchestration Cluster from there (with the [`BEARER_TOKEN` authentication](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#available-authentication-methods)),
both applications must use the same IdP. You also need to make the cluster accept the token passed by Camunda Hub.
To do so, include the Camunda Hub UI's token audience in the configured list of audiences.

#### Example IdP configuration

The following examples show typical OIDC settings in `application.yaml`. Adapt the values to your environment and IdP configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
