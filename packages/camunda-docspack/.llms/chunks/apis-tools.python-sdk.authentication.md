# Authentication

# Authentication

The SDK supports three authentication strategies, controlled by `CAMUNDA_AUTH_STRATEGY`:

| Strategy | When to use                                               |
| -------- | --------------------------------------------------------- |
| `NONE`   | Local development with unauthenticated Camunda (default)  |
| `OAUTH`  | Camunda SaaS or any OAuth 2.0 Client Credentials endpoint |
| `BASIC`  | Self-Managed Camunda with Basic auth (username/password)  |


## Auto-detection

If you omit `CAMUNDA_AUTH_STRATEGY`, the SDK infers it from the credentials you provide:

- Only `CAMUNDA_CLIENT_ID` + `CAMUNDA_CLIENT_SECRET` → **OAUTH**
- Only `CAMUNDA_BASIC_AUTH_USERNAME` + `CAMUNDA_BASIC_AUTH_PASSWORD` → **BASIC**
- No credentials → **NONE**
- Both OAuth and Basic credentials present → **error** (set `CAMUNDA_AUTH_STRATEGY` explicitly)

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/authentication
