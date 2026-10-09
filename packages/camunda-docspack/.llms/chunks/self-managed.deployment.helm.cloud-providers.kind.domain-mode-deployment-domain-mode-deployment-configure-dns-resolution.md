# Deploy Camunda 8 to a local kind cluster — Domain mode deployment {#domain-mode-deployment} — Configure DNS resolution

For pods inside the cluster to resolve `camunda.example.com`, configure CoreDNS to rewrite DNS queries:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/coredns-config.sh
```

This configuration rewrites DNS queries for `camunda.example.com` and `zeebe-camunda.example.com` to the Contour Envoy service (`contour-envoy.projectcontour.svc.cluster.local`), allowing pods to reach Camunda services using the same domain names as external clients.

Review the CoreDNS configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/configs/coredns-configmap-contour.yaml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
