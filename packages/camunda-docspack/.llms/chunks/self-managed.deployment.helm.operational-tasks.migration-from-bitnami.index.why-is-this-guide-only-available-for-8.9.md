# Migrate from Bitnami subcharts — Why is this guide only available for 8.9?

The migration tooling deploys a Bitnami-based "source" installation and migrates its data to operator- or managed-service-backed targets. Because chart `15.x` (Camunda 8.10) no longer bundles Bitnami subcharts, the source side of the migration can only exist on Camunda 8.9 and earlier.

The recommended path is therefore:

1. **While on Camunda 8.9**, migrate your Bitnami-managed infrastructure to [Kubernetes operators or managed services](https://docs.camunda.io/docs/8.9/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/).
2. **Then upgrade** from 8.9 to 8.10 with a standard Helm upgrade, since your infrastructure is already operator- or managed-service-backed.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/index
