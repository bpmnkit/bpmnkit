# Install Camunda for production with Helm — Next steps

### Upgrade and maintenance

- Make sure to follow our [upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index) when performing the upgrade on your Helm chart.
- Ensure your Kubernetes secrets are created before installing or upgrading the Helm chart. For details, see the [secret management guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management).

### Adding more orchestration clusters

Camunda 8 supports running multiple orchestration clusters in separate namespaces. This setup allows you to isolate environments such as development, staging, and production, while sharing infrastructure resources.

To add another orchestration cluster, see [add another Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#add-another-orchestration-cluster).

### Running benchmarks

If you would like to run benchmarks on the platform, refer to the Camunda 8 benchmark [community project](https://github.com/camunda-community-hub/camunda-8-benchmark).

### Reference architectures

You can lean more about Camunda production deployment and available deployment architectures in [Camunda Deployment Reference Architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture) section of our documentation.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
