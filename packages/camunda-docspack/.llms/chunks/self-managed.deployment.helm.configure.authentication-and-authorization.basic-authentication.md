# Set up the Helm chart with basic authentication

Learn how to configure and manage Basic authentication for Camunda 8 Self-Managed deployments using Helm chart.

By default, Camunda 8 Self-Managed uses Basic authentication for all components deployed through the Helm chart. This method requires no additional configuration and is ideal for local or development environments.

**Info: Bitnami subcharts removed in Camunda 8.10**
Earlier releases bundled Keycloak and PostgreSQL through Bitnami subcharts (`identityKeycloak`, `webModelerPostgresql`). As of Camunda 8.10 (Helm chart `15.x`), the bundled Bitnami subcharts are removed: deploy Keycloak and PostgreSQL with [Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) or managed services, as shown in the examples below.

**Note**
Because Basic authentication is enabled by default, components that depend on Management Identity (which implements OIDC/OAuth authentication) are disabled by default. These components include:

- Management Identity
- Console
- Web Modeler
- Keycloak
- Optimize

In this guide, you'll learn how to:

- Deploy the Orchestration Cluster and Connectors with Basic authentication.
- Add additional components, using a hybrid approach, combining Basic authentication and OIDC.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/basic-authentication
