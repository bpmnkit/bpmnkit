# HTTP proxy configuration

Configure HTTP proxy settings for Camunda connectors in Self-Managed environments.

Configure HTTP proxy settings for Camunda connectors in Self-Managed environments.


## Configuration methods

In Self-Managed environments, you can configure connectors to route HTTP requests through a proxy server using one of these two methods:

| Configuration type                                                                        | Scope                                                                                                                                                  | Example                                                                                                                                                                            |
| :---------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JVM properties](https://docs.oracle.com/javase/8/docs/technotes/guides/net/proxies.html) | JVM, **the whole runtime** will be affected. **Any HTTP client** used internally (for example, in a connector, or the Zeebe client) might be affected. | `-Dhttp.proxyHost=proxy -Dhttp.proxyPort=3128 -Dhttps.proxyHost=proxy -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=OTHER_DOMAIN`                                                    |
| Environment variables                                                                     | Connector-scoped, **only supported connectors** such as the REST connector will be affected                                                            | `CONNECTOR_HTTP_PROXY_HOST=proxy; CONNECTOR_HTTP_PROXY_PORT=3128; CONNECTOR_HTTPS_PROXY_HOST=proxy; CONNECTOR_HTTPS_PROXY_PORT=3128; CONNECTOR_HTTP_NON_PROXY_HOSTS=OTHER_DOMAIN;` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration
