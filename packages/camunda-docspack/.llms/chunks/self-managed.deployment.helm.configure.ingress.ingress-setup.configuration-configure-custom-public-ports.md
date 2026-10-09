# Configure the Helm chart with Ingress — Configuration — Configure custom public ports

Set `global.ingress.publicPorts` when clients reach your Ingress controller on ports other than `80` and `443`. For example, a local cluster that can't bind the standard ports might map the Ingress controller to host ports `8080` and `8443`.

| Parameter                          | Type    | Default | Description                                              |
| ---------------------------------- | ------- | ------- | -------------------------------------------------------- |
| `global.ingress.publicPorts.http`  | integer | `80`    | The public port for Ingress endpoints with TLS disabled. |
| `global.ingress.publicPorts.https` | integer | `443`   | The public port for Ingress endpoints with TLS enabled.  |

Both values accept integers from 1 to 65535. The chart omits port `80` from HTTP URLs and port `443` from HTTPS URLs.

The TLS setting for each Ingress determines which public port the chart uses. For web applications, the chart uses `global.ingress.tls.enabled`. For the Zeebe gRPC Ingress, it uses `orchestration.ingress.grpc.tls.enabled`, even when `global.ingress.enabled` is `false`.

Setting a public port doesn't enable TLS.

The chart adds the public port to the URLs it derives from `global.host` and the Zeebe gRPC Ingress host:

- Links in the installation notes and release information.
- The Identity URL and its login callback, if `identity.fullURL` is empty.
- The WebSocket port browsers use to connect to Web Modeler, if Web Modeler has a context path.

The chart doesn't rewrite URLs you configure explicitly. Include the port in `identity.fullURL`, `global.identity.auth.publicIssuerUrl`, and each `global.identity.auth.<component>.redirectUrl`.

Public ports change only the generated URLs. They don't configure Ingress controller listeners, Kubernetes Services, or host port mappings. Configure your Ingress controller and cluster to expose the required ports.

The Gateway API integration doesn't use these values. To change the Gateway listener ports, see [custom listener ports](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup#custom-listener-ports).

The following example configures the generated web application URLs to use HTTPS on public port `8443`:

```yaml
global:
  host: "camunda.example.com"
  ingress:
    enabled: true
    className: nginx
    tls:
      enabled: true
      secretName: camunda-platform
    publicPorts:
      https: 8443
  identity:
    auth:
      publicIssuerUrl: "https://camunda.example.com:8443/auth/realms/camunda-platform"
      optimize:
        redirectUrl: "https://camunda.example.com:8443/optimize"
      webModeler:
        redirectUrl: "https://camunda.example.com:8443/modeler"
      console:
        redirectUrl: "https://camunda.example.com:8443/console"

identity:
  contextPath: "/identity"
  fullURL: "https://camunda.example.com:8443/identity"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
