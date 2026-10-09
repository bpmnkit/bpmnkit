# Configuration — HTTP proxy configuration — Choose an authentication method

The runtime authenticates with either OAuth 2.0 client credentials or an API key. The method is selected from the values you set, in this order:

1. If the token endpoint, client ID, and client secret are all set, the runtime uses OAuth 2.0 client credentials. This wins even when an API key is also set.
1. Otherwise, if an API key is set, the runtime uses API key authentication.
1. Otherwise the connector is not configured, and every job fails.

| Environment variable                           | Helm value                                              | Required    | Description                                                                            |
| :--------------------------------------------- | :------------------------------------------------------ | :---------- | :------------------------------------------------------------------------------------- |
| `APP_INTEGRATIONS_API_KEY`                     | `connectors.appIntegrations.apiKey.secret`              | For API key | Sent in the `X-API-KEY` header.                                                        |
| `APP_INTEGRATIONS_OAUTH_TOKEN_ENDPOINT`        | `connectors.appIntegrations.oauth.tokenEndpoint`        | For OAuth   | OAuth 2.0 token endpoint.                                                              |
| `APP_INTEGRATIONS_OAUTH_CLIENT_ID`             | `connectors.appIntegrations.oauth.clientId`             | For OAuth   | OAuth 2.0 client ID.                                                                   |
| `APP_INTEGRATIONS_OAUTH_CLIENT_SECRET`         | `connectors.appIntegrations.oauth.secret`               | For OAuth   | OAuth 2.0 client secret.                                                               |
| `APP_INTEGRATIONS_OAUTH_AUDIENCE`              | `connectors.appIntegrations.oauth.audience`             | No          | Identifier of the API the token is requested for.                                      |
| `APP_INTEGRATIONS_OAUTH_SCOPES`                | `connectors.appIntegrations.oauth.scopes`               | No          | Requested token scopes.                                                                |
| `APP_INTEGRATIONS_OAUTH_CLIENT_AUTHENTICATION` | `connectors.appIntegrations.oauth.clientAuthentication` | No          | How the credentials are transmitted: `credentialsBody` (default) or `basicAuthHeader`. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
