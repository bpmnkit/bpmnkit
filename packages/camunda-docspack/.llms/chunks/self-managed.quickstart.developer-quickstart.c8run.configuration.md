# Configure Camunda 8 Run

Configure startup options, authentication, APIs, connectors, TLS, metrics, and environment variables for Camunda 8 Run.

<!-- markdownlint-disable MD033 -->

Use this page to configure Camunda 8 Run beyond the default local quickstart.


## Configuration options

The following options provide a convenient way to override settings for quick tests and interactions in Camunda 8 Run.

For more advanced or permanent configuration, modify the default `configuration/application.yaml` or supply a custom file using the `--config` flag.

| Argument                   | Description                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--config <path>`          | Applies the specified Zeebe [`application.yaml`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration).                                                                                                                 |
| `--extra-driver <path>`    | Copies an external JDBC driver into `camunda-zeebe-<version>/lib` before startup. Use this when running against Oracle, MySQL, or other databases that require a driver that is not bundled with Camunda 8 Run. Repeat the flag to copy multiple JARs. |
| `--username <arg>`         | Configures the first user’s username as `<arg>`.                                                                                                                                                                                                       |
| `--password <arg>`         | Configures the first user’s password as `<arg>`.                                                                                                                                                                                                       |
| `--keystore <arg>`         | Configures the TLS certificate for HTTPS. If not specified, HTTP is used. For more information, see [enable TLS](#enable-tls).                                                                                                                         |
| `--keystorePassword <arg>` | Provides the password for the JKS keystore file.                                                                                                                                                                                                       |
| `--port <arg>`             | Sets the Camunda core port (default: `8080`).                                                                                                                                                                                                          |
| `--log-level <arg>`        | Sets the log level for the Camunda core.                                                                                                                                                                                                               |
| `--startup-url`            | The URL to open after startup (for example, `http://localhost:8080/operate`). By default, Operate is opened.                                                                                                                                           |
| `--no-browser`             | Skips opening a browser window after startup. Useful for headless or CI environments.                                                                                                                                                                  |

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
