# Deploy Camunda 8 to a local kind cluster — Domain mode deployment {#domain-mode-deployment} — Deploy the Ingress controller

Deploy the [Contour Ingress controller](https://projectcontour.io/) to handle incoming traffic:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/contour-deploy.sh
```

This script:

1. Installs Contour via Helm.
2. Configures Envoy to run on the control plane node with `hostNetwork: true`.
3. Waits until the Envoy deployment is ready.

Verify the Ingress controller is running:

```bash
kubectl get pods -n projectcontour
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
