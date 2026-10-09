# Configure pod networking — Custom DNS configuration

Every Camunda component also supports a `dnsConfig` value that lets you supply custom DNS nameservers, search domains, and resolver options. It maps directly to the Kubernetes [`dnsConfig` pod spec field](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-dns-config).

The following components support `dnsConfig`:

| Component              | Value key                         |
| ---------------------- | --------------------------------- |
| Orchestration cluster  | `orchestration.dnsConfig`         |
| Identity               | `identity.dnsConfig`              |
| Connectors             | `connectors.dnsConfig`            |
| Optimize               | `optimize.dnsConfig`              |
| Console                | `console.dnsConfig`               |
| Web Modeler REST API   | `webModeler.restapi.dnsConfig`    |
| Web Modeler WebSockets | `webModeler.websockets.dnsConfig` |

Use `dnsConfig` when you need to override or extend the default DNS resolver — for example, to add a private nameserver or a custom search domain:

```yaml
connectors:
  dnsPolicy: None
  dnsConfig:
    nameservers:
      - 192.168.1.100
    searches:
      - my-namespace.svc.cluster.local
      - svc.cluster.local
    options:
      - name: ndots
        value: "5"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-networking
