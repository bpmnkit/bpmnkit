# Configure the Helm chart with Ingress — Separated Ingress migration

As the separated Ingress was removed in Camunda 8.8, there are two options for migration:

1. **Recommended:** Use the [combined Ingress configuration](#configuration).
2. **Alternative:** You can use global.extraManifests to define and deploy your own Ingress objects, providing functionality similar to the former separated Ingress setup.

The example below demonstrates how to add an Ingress object for Optimize, replicating the separated Ingress behavior. You can apply the same approach to create additional Ingress objects for other components, as needed.

```yaml
# values-separated-ingress.yaml
global:
  extraManifests:
    - |
      ---
      apiVersion: networking.k8s.io/v1
      kind: Ingress
      metadata:
        name: camunda-platform-optimize
        namespace: camunda-dev
        annotations:
          nginx.ingress.kubernetes.io/backend-protocol: HTTP
          nginx.ingress.kubernetes.io/proxy-body-size: 10m
          nginx.ingress.kubernetes.io/proxy-buffer-size: 128k
          nginx.ingress.kubernetes.io/proxy-buffering: "on"
          nginx.ingress.kubernetes.io/rewrite-target: /
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
      spec:
        ingressClassName: nginx
        rules:
        - host: optimize.example.com
          http:
            paths:
            - backend:
                service:
                  name: camunda-platform-optimize
                  port:
                    number: 80
              path: /
              pathType: Prefix
        tls:
        - hosts:
          - optimize.example.com
          secretName: camunda-platform-optimize-tls
    - |
      [Add more Ingresses as needed]
```

Please note that, you need to create all resources referenced by the objects in `global.extraManifests`, such as the TLS secret `camunda-platform-optimize-tls`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
