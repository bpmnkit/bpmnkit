# Troubleshoot Zeebe connection issues — Secure connection to Zeebe fails

If you provide a cluster URL starting with `https`, Camunda Hub will try to establish a secure connection to
the Zeebe instance.
In the process, it strictly validates the server's Application-Layer Protocol Negotiation (ALPN) support and its certificates
presented against well-known certificate authorities.
Failure to connect may have several reasons:

### Configure the gateway to accept secure connections

Ensure you properly configure the remote cluster URL to accept secure connections.
Refer to the [Zeebe Gateway configuration documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-client-communication#gateway)
for additional information.

### Configure the gateway to support ALPN

[Inspect the connection](#how-can-i-get-details-about-a-secure-remote-connection) to understand if ALPN is supported
by the server.

Secure connections to Zeebe require an Ingress controller that supports HTTP/2 over TLS with protocol negotiation via ALPN.
Ensure you properly [configured your Zeebe Ingress to support ALPN](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/self-managed/operational-guides/troubleshooting#zeebe-ingress-grpc).

### Configure `modeler-restapi` to trust a custom Zeebe SSL certificate

[Inspect the connection](#how-can-i-get-details-about-a-secure-remote-connection) to understand which certificates are
being returned by the server and ensure you configure Camunda Hub for [custom SSL certificates](#how-can-i-provide-a-custom-zeebe-ssl-certificate).

If intermediate signing authorities sign the server certificate, ensure the remote endpoint [serves both server and
intermediate certificates](https://nginx.org/en/docs/http/configuring_https_servers.html#chains) to Camunda Hub.

### OAuth token cache for the `modeler-restapi` process

When using the `OAuth` authentication method for deploying to Zeebe, Camunda Hub caches OAuth tokens in memory by
default. No filesystem access is required, so running `modeler-restapi` as a non-root user (for example, via Kubernetes'
`securityContext.runAsUser` option) or on a read-only container filesystem works out of the box.

If you want to persist tokens across restarts of `modeler-restapi`, opt in to a file-based cache by setting the
`CAMUNDA_CLIENT_CONFIG_PATH` environment variable to a writeable file location. If you are using legacy Zeebe client environment variables, you can also use `ZEEBE_CLIENT_CONFIG_PATH`. Ensure the directory exists and is
writeable by the process user:

```shell
CAMUNDA_CLIENT_CONFIG_PATH=/path/to/credentials/cache.txt
```

**Note**
Before Camunda 8.10, the file-based cache was enabled by default and pointed at `$HOME/.camunda/credentials`. Running
as a non-root user without overriding this path caused `IOException`s on first cache write. If you previously set
`CAMUNDA_CLIENT_CONFIG_PATH` or `ZEEBE_CLIENT_CONFIG_PATH` (legacy) solely to work around that error, you can now remove the variable and rely on the in-memory
default.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection
