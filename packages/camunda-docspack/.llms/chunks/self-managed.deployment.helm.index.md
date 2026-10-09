# Camunda Helm chart

Learn how to install Camunda 8 Self-Managed using Kubernetes with Helm.

Camunda recommends using Kubernetes and Helm to deploy and run Camunda 8 Self-Managed in production environments.

There are many ways to provision and configure a Kubernetes cluster, and several architectural decisions to consider. For example, will your workers run inside the Kubernetes cluster or externally? You'll need to configure the cluster accordingly and tailor the setup to your architecture.

Camunda provides continuously improved Helm charts that are not tied to any specific cloud provider allowing you to choose your preferred Kubernetes platform. These charts are available in the [Camunda Helm repository](https://artifacthub.io/packages/helm/camunda/camunda-platform). To provide feedback or report issues, use the [Helm GitHub repository](https://github.com/camunda/camunda-platform-helm/issues).

**Note: Helm CLI support**

Camunda recommends Helm CLI v4 and supports it for the full release cycles of Camunda 8.9 and 8.10. Camunda supports Helm CLI v3 (3.10 or later) until February 10, 2027, when upstream support ends. After February 10, 2027, Camunda no longer supports Helm CLI v3. Customers who continue to use Helm CLI v3 after that date do so at their own risk.

Use Helm CLI v4 for new installations.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/index
