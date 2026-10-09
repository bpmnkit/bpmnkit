# Set up the Helm chart with an in-cluster Keycloak instance

Learn how to deploy an in-cluster Keycloak instance with the Keycloak operator and connect Camunda 8 Self-Managed to it using the Helm chart.

For an in-cluster Keycloak that acts as the identity management service for authentication and authorization, deploy Keycloak with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and connect the Camunda Helm chart to it. The Management Identity component configures Keycloak automatically on startup with a realm and several entities to simplify setup and reduce the learning curve.

Use this setup if you don’t have an external identity provider (IdP) and want to run Keycloak inside your cluster, together with additional Camunda components (Console, Web Modeler, Optimize, Management Identity) that are disabled by default in the Helm chart.

If you prefer to connect to a Keycloak instance you manage elsewhere, see [Set up the Helm chart with an external Keycloak instance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak).

**Info: Keycloak deployment changed in Camunda 8.10**
Earlier releases bundled an internal Keycloak through the `identityKeycloak` Bitnami subchart (`identityKeycloak.enabled: true`). As of Camunda 8.10 (Helm chart `15.x`), the bundled Bitnami subcharts are removed. Deploy Keycloak in-cluster with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and its database with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) (or use a managed database), then wire Camunda to it as shown below. For releases up to 8.9, see the [8.9 internal Keycloak guide](https://docs.camunda.io/docs/8.9/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
