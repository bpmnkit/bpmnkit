# Property reference — Configuration of the `restapi` component — application.yaml

| Property                         | Description                                                                                                                            | Example value                    | Default value    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------- |
| `camunda.ca-certificate-path`    | [optional]Path to a root CA certificate to be used instead of the certificate in the default store.                               | `/path/to/certificate`           | -                |
| `camunda.client.config-path`     | [optional]Path to a file used to cache the client's OAuth credentials on disk. When unset, credentials are cached in memory only. | `/path/to/credentials/cache.txt` | _in-memory only_ |
| `camunda.client.request-timeout` | [optional]The request timeout used when communicating with a target Zeebe cluster.                                                | `60000`                          | `10000`          |
| `camunda.auth.connect-timeout`   | [optional]The connection timeout for requests to the OAuth server.                                                                | `30000`                          | `5000`           |
| `camunda.auth.read-timeout`      | [optional]The data read timeout for requests to the OAuth server.                                                                 | `30000`                          | `5000`           |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
