# Install Camunda 8 on an EKS cluster — (Optional) Ingress Setup

**Info: Domain or domainless installation**

If you do not have a domain name, external access to Camunda 8 web endpoints from outside the AWS VPC will not be possible. In this case, you may skip the DNS setup and proceed directly to [deploying Camunda 8 via Helm charts](#deploy-camunda-8-via-helm-charts).

Alternatively, you can use `kubectl port-forward` to access Camunda without a domain or Ingress configuration. For more information, see the [kubectl port-forward documentation](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/).

Throughout the rest of this installation guide, we will refer to configurations as **"With domain"** or **"Without domain"** depending on whether the application is exposed via a domain.

In this section, we provide an optional setup guide for configuring an Ingress with TLS and DNS management, allowing you to access your application through a specified domain. If you haven't set up an Ingress, refer to the [Kubernetes Ingress documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/) for more details. In Kubernetes, an Ingress is an API object that manages external access to services in a cluster, typically over HTTP, and can also handle TLS encryption for secure connections.

For more details on the Ingress controller used here and its configuration options, refer to the [Contour documentation](https://projectcontour.io/docs/). Contour uses the [Envoy proxy](https://www.envoyproxy.io/) as its data plane to route and load balance Ingress traffic.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
