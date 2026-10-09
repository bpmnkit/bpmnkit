# Property reference — Configuration of the `restapi` component — env

| Environment variable            | Description                                                                                                                            | Example value                    | Default value    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------- |
| `CAMUNDA_CA_CERTIFICATE_PATH`   | [optional]Path to a root CA certificate to be used instead of the certificate in the default store.                               | `/path/to/certificate`           | -                |
| `CAMUNDA_CLIENT_CONFIG_PATH`    | [optional]Path to a file used to cache the client's OAuth credentials on disk. When unset, credentials are cached in memory only. | `/path/to/credentials/cache.txt` | _in-memory only_ |
| `CAMUNDA_CLIENT_REQUESTTIMEOUT` | [optional]The request timeout used when communicating with a target Zeebe cluster.                                                | `60000`                          | `10000`          |
| `CAMUNDA_AUTH_CONNECT_TIMEOUT`  | [optional]The connection timeout for requests to the OAuth server.                                                                | `30000`                          | `5000`           |
| `CAMUNDA_AUTH_READ_TIMEOUT`     | [optional]The data read timeout for requests to the OAuth server.                                                                 | `30000`                          | `5000`           |

For more details, [see the Zeebe connection troubleshooting section](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
