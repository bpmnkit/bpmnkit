# Troubleshooting — Resolve a general Zeebe connection issue

You try to connect to Zeebe from both Desktop Modeler _and_ community-supported [`zbctl`](https://github.com/camunda-community-hub/zeebe-client-go/blob/main/cmd/zbctl/zbctl.md), and neither of them works. General connection failures can have a couple of reasons:

### The (remote) orchestration cluster is not reachable {#the-remote-zeebe-instance-is-not-reachable}

Ensure your computer has access to the (remote) network.

**Tip**
If you run against a Camunda 8 SaaS free-trial cluster, ensure it is [not paused](https://docs.camunda.io/docs/next/components/saas/clusters#auto-pause).

### The connection to Zeebe happens through a proxy

[Inspect the connection](#how-can-i-get-details-about-a-secure-remote-connection) to understand if it can be established.

Secure connections to Zeebe require [HTTP/2 over TLS with protocol negotiation via ALPN](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting#zeebe-ingress-grpc). Ensure your proxy supports these features and does not forcefully downgrade the connection to HTTP/1.

### The connection to Zeebe should not happen through a proxy

If you are using a proxy but do not want to connect to Zeebe through it, exclude Zeebe from proxying by adding it to the `NO_PROXY` environment variable:

```plain
set NO_PROXY=localhost,127.0.0.1,some.intranet.host && "Camunda Modeler.exe"
```

```plain
NO_PROXY=localhost,127.0.0.1,some.intranet.host camunda-modeler
```

```plain
NO_PROXY=localhost,127.0.0.1,some.intranet.host camunda-modeler
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
