# JDBC driver management for RDBMS

Understand bundled JDBC drivers, when to supply custom drivers, and how to load them in Kubernetes.

This page covers JDBC driver management for RDBMS deployments in Kubernetes. For background on secondary storage, see [secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index). For configuration and troubleshooting, see [configure RDBMS in Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms). For an end-to-end example, see [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms).


## Bundled vs. custom JDBC drivers

### Which drivers are included?

Camunda bundles JDBC drivers for databases where licensing permits:

| Database   | Bundled | When to supply custom drivers                                                                |
| ---------- | ------- | -------------------------------------------------------------------------------------------- |
| PostgreSQL | Yes     | Patches, extensions, or compatibility with older server versions.                            |
| MariaDB    | Yes     | Custom JDBC features or compliance requirements.                                             |
| SQL Server | Yes     | Custom features or version-specific requirements.                                            |
| H2         | Yes     | Development and testing only; not recommended for production due to scalability limitations. |
| Oracle     | No      | Always; licensing prevents bundling.                                                         |
| MySQL      | No      | Always; licensing prevents bundling.                                                         |

### When to supply a custom driver

Consider supplying a custom JDBC driver in these scenarios:

1. **Oracle or MySQL databases**: No bundled drivers available; custom drivers required.
2. **Version compatibility**: Your database version is not compatible with the bundled driver.
3. **Security patches**: A critical patch is available for the bundled driver before the next Camunda release.
4. **Custom extensions**: You use database-specific features not covered by bundled drivers.
5. **Compliance or licensing**: Your organization policy requires specific driver versions or sources.

### Driver provisioning strategies

Choose one of the three approaches below. **Init container is recommended for production.**

| Strategy             | Pros                                    | Cons                               | Best for                |
| -------------------- | --------------------------------------- | ---------------------------------- | ----------------------- |
| **Init container**   | Automatic at pod startup; reproducible. | Requires external download source. | Production (standard)   |
| **Custom image**     | Simple for teams with image registries. | Not yet validated in production.   | Dev/test only           |
| **ConfigMap/Volume** | GitOps-friendly; no external downloads. | Requires manual driver management. | Teams with restrictions |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers
