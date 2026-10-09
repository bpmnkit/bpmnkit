# Set up the Helm chart with an external Microsoft Entra tenant

Learn how to connect the Camunda Helm chart to a Microsoft Entra tenant.

This guide shows you how to configure the Helm chart to use a Microsoft Entra tenant, with each Camunda component using a dedicated OIDC or OAuth client.

**Info: Bitnami subcharts removed in Camunda 8.10**
Earlier releases bundled PostgreSQL through Bitnami subcharts (`identityPostgresql`, `webModelerPostgresql`). As of Camunda 8.10 (Helm chart `15.x`), the bundled Bitnami subcharts are removed: provide PostgreSQL with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) or a managed database, as shown in the examples below.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
