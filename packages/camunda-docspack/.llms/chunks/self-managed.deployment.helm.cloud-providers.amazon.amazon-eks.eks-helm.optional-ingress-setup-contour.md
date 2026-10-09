# Install Camunda 8 on an EKS cluster — (Optional) Ingress Setup — Contour

[Contour](https://projectcontour.io/) is a CNCF Incubating, open-source Kubernetes Ingress controller that uses the [Envoy proxy](https://www.envoyproxy.io/) as its data plane. It manages external access to services within a Kubernetes cluster, acting as a reverse proxy and load balancer that routes incoming traffic to the appropriate services based on rules defined in the Ingress resource.

The following installs `contour` in the `projectcontour` namespace via Helm. For more configuration options, consult the [Contour Helm chart](https://projectcontour.github.io/helm-charts/).

```shell reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/install-contour.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
