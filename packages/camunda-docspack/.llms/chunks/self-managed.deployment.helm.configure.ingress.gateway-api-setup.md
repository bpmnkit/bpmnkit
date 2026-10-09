# Configure the Helm chart with Gateway API

Set up and configure the Kubernetes Gateway API for Camunda 8 Self-Managed Helm deployments.

Use this guide to configure the Camunda 8 Helm chart with the Kubernetes Gateway API instead of a traditional Ingress controller.

The Gateway API provides a modern way to manage inbound traffic in Kubernetes clusters. It improves on the Ingress API in the following ways:

- Separates cluster operators, who manage Gateway resources, from application teams, who manage HTTPRoute resources.
- Enables fine-grained traffic configuration without relying on controller-specific annotations.

**Note**
The Ingress-NGINX controller is planned to reach end of life in March 2026 (see [the Kubernetes announcement on Ingress-NGINX retirement](https://www.kubernetes.dev/blog/2025/11/12/ingress-nginx-retirement/)). Plan a migration to the Gateway API where it fits your use case.

If you decide not to adopt the Gateway API, you can migrate to a different Ingress controller and continue using the Ingress API. This remains a supported approach.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
