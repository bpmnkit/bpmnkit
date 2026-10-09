# Configure the Helm chart with Gateway API — Additional configuration

### TLS

To enable HTTPS, add a TLS certificate to a Kubernetes Secret and reference it:

```yaml
global:
  host: "camunda.example.com"
  gateway:
    enabled: true
    createGatewayResource: true
    className: nginx
    tls:
      enabled: true
      secretName: camunda-tls
```

When TLS is enabled, the chart configures the Gateway listener on port 443 with `protocol: HTTPS` and sets `sectionName: https` on all HTTPRoutes, and sets `sectionName: grpcs` on the GRPCRoute (used by Zeebe).

### Custom listener ports

By default the Gateway listens on port `80` for HTTP and port `443` for HTTPS. Set `global.gateway.port` and `global.gateway.tls.port` when your Gateway controller exposes these on non-standard ports, for example, Traefik's `websecure` entrypoint on `8443`:

```yaml
global:
  host: "camunda.example.com"
  gateway:
    enabled: true
    createGatewayResource: true
    className: nginx
    port: 8080
    tls:
      enabled: true
      secretName: camunda-platform
      port: 8443
```

### Externally-managed Gateway with custom listener names

When attaching Routes to a Gateway you do not manage (for example, one owned by a Cluster Operator), its listener names may not match the chart defaults (`http`, `https`, `grpc`, `grpcs`). Use `global.gateway.httpSectionName` and `global.gateway.grpcSectionName` to point the Routes' `parentRefs.sectionName` at the listener names the target Gateway actually defines:

```yaml
global:
  host: "camunda.example.com"
  gateway:
    enabled: true
    createGatewayResource: false
    name: shared-gateway
    namespace: shared-infra
    httpSectionName: web
    grpcSectionName: grpc-web
```

**Warning**
Only set the `sectionName` overrides for an externally-managed Gateway, and make sure each value matches a listener name on that Gateway. When the chart manages the Gateway (`createGatewayResource: true`), the listener names are always `http`, `https`, `grpc`, and `grpcs`. Setting an override in that case detaches the Routes from the Gateway with no error.

### NGINX Gateway Fabric: ProxySettingsPolicy

If you are using the NGINX Gateway Fabric, the default proxy buffer size is likely too small for Camunda. You may see errors such as:

> 502: upstream sent too big header while reading response header from upstream

Install the `ProxySettingsPolicy` CRD ([CRD location](https://github.com/nginx/nginx-gateway-fabric/tree/main/config/crd/bases)) and apply the following resource in your Camunda namespace:

```yaml
apiVersion: gateway.nginx.org/v1alpha1
kind: ProxySettingsPolicy
metadata:
  name: camunda-platform
  namespace: camunda
spec:
  buffering:
    bufferSize: 128k
    buffers:
      number: 8
      size: 128k
    busyBuffersSize: 256k
  targetRefs:
    - group: gateway.networking.k8s.io
      kind: Gateway
      name: camunda-platform
```

See the [ProxySettingsPolicy documentation](https://docs.nginx.com/nginx-gateway-fabric/traffic-management/proxy-settings/) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
