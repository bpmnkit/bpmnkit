# Install Camunda 8 on an AKS cluster — (Optional) Ingress Setup

**Info: Domain or domainless installation**

If you do not have a domain name, external access to Camunda 8 web endpoints from outside the Azure Virtual Network will not be possible. In this case, skip the DNS setup and proceed directly to [deploying Camunda 8 via Helm charts](#deploy-camunda-8-via-helm-charts).

Alternatively, you can use `kubectl port-forward` to access Camunda without a domain or Ingress configuration. For more information, see the [kubectl port-forward documentation](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/).

Throughout the rest of this guide, we refer to configurations as **"With domain"** or **"Without domain"**, depending on whether the application is exposed through a domain.

In this section, we provide an optional setup guide for configuring an Ingress with TLS and DNS management, allowing you to access your application through a specified domain. If you haven't set up an Ingress, refer to the [Kubernetes Ingress documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/) for more details. In Kubernetes, an Ingress is an API object that manages external access to services in a cluster, typically over HTTP, and can also handle TLS encryption for secure connections.

To monitor your Ingress setup using Azure Monitor, you may find the official guide on [monitoring Ingress controllers with Azure Monitor and Prometheus](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-prometheus-integration) helpful. For more details on the Ingress controller used in this guide and its configuration options, refer to the [Contour documentation](https://projectcontour.io/docs/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
