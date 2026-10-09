# Deploy an AKS cluster with Terraform (advanced) — Requirements — Considerations

This setup provides a basic foundation for getting started with Camunda 8 on AKS, but it is not fully optimized for performance. It serves as a good starting point for building out a production-ready environment by incorporating [IaC tooling](https://developer.hashicorp.com/terraform/tutorials/azure-get-started/infrastructure-as-code).

To try out Camunda 8 or for development purposes, consider signing up for our [SaaS offering](https://camunda.com/platform/). If you already have an AKS cluster, you can skip ahead to the [Helm guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm).

To keep this guide simple and focused, certain best practices are referenced via links to additional documentation, allowing you to explore each area in more detail when you're ready.

**Warning**

Reference architectures are not intended to be consumed exactly as described. The examples provided in this guide are not packaged as a reusable Terraform module. It is recommended that you clone the repository and make any necessary modifications locally.

This approach allows you to extend and customize the codebase according to your specific needs. However, note that maintaining the infrastructure is your responsibility. Camunda will continue to update and improve the reference architecture, and these updates may not be backward compatible. You may incorporate updates into your customized codebase as needed.

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
