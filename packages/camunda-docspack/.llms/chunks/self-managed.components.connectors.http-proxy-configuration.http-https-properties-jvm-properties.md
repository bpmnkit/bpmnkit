# HTTP proxy configuration — HTTP/HTTPS properties — JVM properties

You can set the following standard JVM properties for HTTP and HTTPS:

| Property (HTTP target URL) | Property (HTTPS target URL) | Description                                              |
| :------------------------- | :-------------------------- | :------------------------------------------------------- |
| `http.proxyHost`           | `https.proxyHost`           | The host name of the proxy server.                       |
| `http.proxyPort`           | `https.proxyPort`           | The port number (default is 80 for HTTP, 443 for HTTPS). |

Some HTTP clients might offer more properties to configure the proxy. For example, the [Apache HTTP client](https://hc.apache.org/httpcomponents-client-5.6.x/current/httpclient5/apidocs/org/apache/hc/client5/http/impl/classic/HttpClientBuilder.html) used in the REST connector offers the following properties:

| Property (HTTP target URL) | Property (HTTPS target URL) | Description                                       |
| :------------------------- | :-------------------------- | :------------------------------------------------ |
| `http.proxyUser`           | `https.proxyUser`           | _(optional)_ The username to log in to the proxy. |
| `http.proxyPassword`       | `https.proxyPassword`       | _(optional)_ The password to log in to the proxy. |

The `http.nonProxyHosts` property applies to both HTTP and HTTPS target URLs:

| Property             | Description                                                                                                                                                                                                                                                                                                                     |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `http.nonProxyHosts` |  _(optional)_ A list of hosts to connect to directly, bypassing the proxy.Specify as a list of patterns, separated by \|.Patterns can start or end with a `*` for wildcards.Any host matching one of these patterns uses a direct connection instead of a proxy. |

**Note**
To ensure Camunda can properly access Camunda components when using JVM properties, non-proxy hosts must contain `camunda-platform-zeebe|camunda-platform-keycloak`.

**Important**
The connector runtime uses internal HTTP calls between pods (for example, for `/connectors/inbound-instances`) by resolving the headless service name to pod IPs. These internal calls use the resolved IP (for example, `10.7.108.230`), not the original service hostname. If you configure JVM-wide proxies using `-Dhttp.proxyHost` or `-Dhttps.proxyHost`, make sure `http.nonProxyHosts` (and/or `CONNECTOR_HTTP_NON_PROXY_HOSTS`) also includes patterns for your cluster CIDRs (for example, `10.*` or `10.244.*`), not only service DNS names like `*.svc.cluster.local`. Otherwise, internal pod-to-pod traffic may be routed through your corporate proxy and fail with 403 or TLS parsing errors.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration
