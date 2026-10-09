# HTTP proxy configuration — How proxy configuration works

The process consists of two main steps: configuration and request handling.

### Set your configuration

First, define how the proxy should behave.
These are the available configuration options:

- Enable or disable proxying.
- Define which URLs should skip the proxy, listed as `nonProxyHosts`.
- Define which URLs require authentication.

### Handle requests

When a connector makes an HTTP request, it's handled according to your previously set configuration:

1. Check if the proxy is enabled:
   1. Yes: Proceed with proxying.
   1. No: Do not proxy; the request is handled directly.
1. Check if the host is listed in `nonProxyHosts`:
   1. Yes: Do not proxy; the request bypasses the proxy.
   1. No: Proceed with proxying.
1. Check if the proxy requires authentication:
   1. Yes: The request is proxied only if authentication succeeds; otherwise, it returns an authentication error.
   1. No: The request is proxied normally.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration
