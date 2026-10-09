# Install Helm chart in air-gapped environments — Best practices

- **Mirror images and charts regularly**: Sync images and charts on a schedule to avoid version drift.
- **Pin versions**: Use explicit tags instead of `latest` to ensure reproducibility.
- **Validate charts**: Test Helm charts in a staging air-gapped environment before production.
- **Monitor dependencies**: Track Camunda and infrastructure dependency updates, since they affect required images.
- **Secure access**: Restrict permissions to your private registry and Helm repository.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
