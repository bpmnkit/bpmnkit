# Troubleshoot proxy configuration issues — Cause

Proxy settings must be correctly configured for Camunda Hub to route outgoing requests through a network proxy. Common issues occur when:

- The proxy server is not properly configured or unreachable.
- Requests to external services are being blocked by the proxy configuration.
- Authentication requests, such as those to the OIDC provider, fail when the JWKS endpoint is unreachable via the proxy.


## Resolution

Ensure a correct proxy configuration for the `restapi` component.

The proxy is configured with standard JVM system properties passed via the environment variable `JAVA_TOOL_OPTIONS`:

```properties
JAVA_TOOL_OPTIONS=-Dhttps.proxyHost=<host> -Dhttps.proxyPort=<port>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-proxy-configuration
