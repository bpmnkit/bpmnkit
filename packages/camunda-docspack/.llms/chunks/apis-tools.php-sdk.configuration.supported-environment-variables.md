# Configuration — Supported environment variables

| Variable                             | Default                                      | Description                                                                          |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `CAMUNDA_REST_ADDRESS`               | `http://localhost:8080/v2`                   | Cluster REST endpoint. `/v2` is appended automatically when absent.                  |
| `ZEEBE_REST_ADDRESS`                 | —                                            | Legacy alias for `CAMUNDA_REST_ADDRESS` (used only when the latter is unset).        |
| `CAMUNDA_AUTH_STRATEGY`              | —                                            | `NONE`, `BASIC`, or `OAUTH`. Auto-detected from the supplied credentials when unset. |
| `CAMUNDA_CLIENT_ID`                  | —                                            | OAuth client id.                                                                     |
| `CAMUNDA_CLIENT_SECRET`              | —                                            | OAuth client secret.                                                                 |
| `CAMUNDA_CLIENT_AUTH_CLIENTID`       | —                                            | Legacy alias for `CAMUNDA_CLIENT_ID`.                                                |
| `CAMUNDA_CLIENT_AUTH_CLIENTSECRET`   | —                                            | Legacy alias for `CAMUNDA_CLIENT_SECRET`.                                            |
| `CAMUNDA_OAUTH_URL`                  | `https://login.cloud.camunda.io/oauth/token` | OAuth token endpoint.                                                                |
| `CAMUNDA_TOKEN_AUDIENCE`             | `zeebe.camunda.io`                           | OAuth token audience.                                                                |
| `CAMUNDA_BASIC_AUTH_USERNAME`        | —                                            | Basic-auth username.                                                                 |
| `CAMUNDA_BASIC_AUTH_PASSWORD`        | —                                            | Basic-auth password.                                                                 |
| `CAMUNDA_TENANT_ID`                  | —                                            | Default tenant id applied to tenant-aware operations.                                |
| `CAMUNDA_TENANT_IDS`                 | —                                            | Comma-separated default tenant ids (e.g. for job activation).                        |
| `CAMUNDA_SDK_LOG_LEVEL`              | `warn`                                       | SDK log level (`error`, `warn`, `info`, `debug`).                                    |
| `CAMUNDA_WORKER_MAX_CONCURRENT_JOBS` | `32`                                         | Default maximum number of jobs a worker activates at once.                           |
| `CAMUNDA_WORKER_TIMEOUT`             | `60000`                                      | Default job activation timeout, in milliseconds.                                     |
| `CAMUNDA_WORKER_REQUEST_TIMEOUT`     | `10000`                                      | Default long-poll request timeout, in milliseconds.                                  |
| `CAMUNDA_WORKER_NAME`                | —                                            | Default worker name reported when activating jobs.                                   |
| `CAMUNDA_MTLS_CERT_PATH`             | —                                            | Path to the client certificate for mutual TLS.                                       |
| `CAMUNDA_MTLS_KEY_PATH`              | —                                            | Path to the client private key for mutual TLS.                                       |
| `CAMUNDA_MTLS_CA_PATH`               | —                                            | Path to the CA bundle used to verify the server certificate.                         |
| `CAMUNDA_MTLS_KEY_PASSPHRASE`        | —                                            | Passphrase protecting the mTLS client key, if any.                                   |
| `CAMUNDA_LOAD_ENVFILE`               | —                                            | Load configuration from a `.env` file. Set to `true` or a file path.                 |

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/configuration
