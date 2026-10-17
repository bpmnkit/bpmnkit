# Troubleshooting — Debug Zeebe connection issues

You can connect to Zeebe via community-supported [`zbctl`](https://github.com/camunda-community-hub/zeebe-client-go/blob/main/cmd/zbctl/zbctl.md) or another API client. However, connecting through Desktop Modeler fails.

### Secure connection to Zeebe fails

When connecting securely to Camunda 8 SaaS, Camunda 8 Self-Managed, or a standalone Zeebe instance (via `https` endpoint URL), Desktop Modeler tries to establish a secure connection. In the process, it strictly validates the server certificates presented against well-known certificate authorities. Failure to connect may have several reasons:

#### The (remote) endpoint is not configured for secure connections

Ensure you properly configured the remote endpoint.

#### The (remote) endpoint presents an untrusted certificate

[Inspect the connection](#how-can-i-get-details-about-a-secure-remote-connection) to understand which certificates are being returned by the server.

Ensure you configure Desktop Modeler for [custom SSL certificates](#how-can-i-provide-a-custom-ssl-certificate).

If intermediate signing authorities sign the server certificate, ensure the remote endpoint [serves both server and intermediate certificates](https://nginx.org/en/docs/http/configuring_https_servers.html#chains) to Desktop Modeler.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
