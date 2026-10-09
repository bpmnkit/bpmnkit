# Configuration reference — Authentication

| Variable                                               | Default  | Description                                                                     |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------- |
| `CAMUNDA_AUTH_STRATEGY`                                | inferred | `OAUTH`, `BASIC`, or `NONE`. Inferred from the supplied credentials when unset. |
| `CAMUNDA_CLIENT_ID` / `ZEEBE_CLIENT_ID`                | —        | OAuth 2.0 client id (client-credentials grant).                                 |
| `CAMUNDA_CLIENT_SECRET` / `ZEEBE_CLIENT_SECRET`        | —        | OAuth 2.0 client secret.                                                        |
| `CAMUNDA_OAUTH_URL` / `ZEEBE_AUTHORIZATION_SERVER_URL` | —        | OAuth 2.0 token endpoint URL.                                                   |
| `CAMUNDA_TOKEN_AUDIENCE`                               | —        | OAuth token audience.                                                           |
| `CAMUNDA_TOKEN_SCOPE`                                  | —        | OAuth token scope.                                                              |
| `CAMUNDA_OAUTH_CACHE_DIR`                              | —        | Directory for the on-disk OAuth token cache.                                    |
| `CAMUNDA_BASIC_AUTH_USERNAME`                          | —        | HTTP Basic authentication username.                                             |
| `CAMUNDA_BASIC_AUTH_PASSWORD`                          | —        | HTTP Basic authentication password.                                             |

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/configuration-reference
