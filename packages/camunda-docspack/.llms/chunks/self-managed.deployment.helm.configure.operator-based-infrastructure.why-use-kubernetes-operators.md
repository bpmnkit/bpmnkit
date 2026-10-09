# Deploy required dependencies with Kubernetes operators — Why use Kubernetes operators?

Using official Kubernetes operators provides several advantages over traditional subcharts:

- **Vendor maintenance**: Each deployment method is maintained by the respective project team (Elastic, CloudNativePG community, Keycloak team) with dedicated engineering resources
- **Production-grade features**: Built-in management, monitoring, and scaling capabilities designed for enterprise environments
- **Vendor support channels**: Official support channels, dedicated vendor support teams, and comprehensive documentation available directly from each project
- **Security-focused**: Regular updates and CVE patches from upstream maintainers with specialized security teams
- **Advanced lifecycle management**: Automated upgrades, failover, and disaster recovery capabilities
- **Best practices implementation**: Following upstream recommended deployment patterns established by vendor experts
- **Vendor expertise**: Access to specialized knowledge and troubleshooting from the teams that build these technologies (through vendor support channels)
- **Future-proof architecture**: Replaces the Bitnami subcharts, removed in Camunda 8.10, with images you choose and update on your own cadence. Each operator still ships its own vendor images, so this changes which supply chain you depend on rather than removing third-party images altogether.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
