# HTTP proxy configuration — HTTP/HTTPS properties — Environment variables

As an alternative to using JVM properties, the proxy settings can also be set with environment variables:

| Variable (HTTP target URL)      | Variable (HTTPS target URL)      | Description                                                                                                                            |
| :------------------------------ | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `CONNECTOR_HTTP_PROXY_HOST`     | `CONNECTOR_HTTPS_PROXY_HOST`     | The host name of the proxy server.                                                                                                     |
| `CONNECTOR_HTTP_PROXY_PORT`     | `CONNECTOR_HTTPS_PROXY_PORT`     | The port number.                                                                                                                       |
| `CONNECTOR_HTTP_PROXY_USER`     | `CONNECTOR_HTTPS_PROXY_USER`     | _(optional)_ The username to log in to the proxy.                                                                                      |
| `CONNECTOR_HTTP_PROXY_PASSWORD` | `CONNECTOR_HTTPS_PROXY_PASSWORD` | _(optional)_ The password to log in to the proxy.                                                                                      |
| `CONNECTOR_HTTP_PROXY_SCHEME`   | `CONNECTOR_HTTPS_PROXY_SCHEME`   | _(optional)_ The scheme of the proxy server. This allows you to use the `https` protocol to contact your proxy. The default is `http`. |

The `CONNECTOR_HTTP_NON_PROXY_HOSTS` variable applies to both HTTP and HTTPS target URLs:

| Variable                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONNECTOR_HTTP_NON_PROXY_HOSTS` |  _(optional)_ A list of hosts to connect to directly, bypassing the proxy.Specify as a list of patterns, separated by \|.Patterns can start or end with a `*` for wildcards.Any host matching one of these patterns uses a direct connection instead of a proxy.Connectors will also use the exception list provided by the `http.nonProxyHosts` JVM property if existing. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration
