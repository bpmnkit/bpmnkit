# Set up the Helm chart with an in-cluster Keycloak instance — Configuration

This guide shows you how to:

- Deploy an in-cluster Keycloak with the Keycloak operator and connect the Helm chart to it.
- Configure the Helm chart with a custom secret for accounts used across all components.
- Enable the application components you want to include in the release.
- Access all components from your local environment.

To use an in-cluster Keycloak instance, complete the following steps:

1. [Create a secret](#create-a-secret)
1. [Deploy Keycloak and connect Camunda](#deploy-keycloak-and-connect-camunda)
1. [Configure Management Identity](#configure-management-identity-and-global-defaults)
1. [Configure components using OIDC](#configure-components-using-oidc)

See the [full configuration example](#full-configuration-example) for the complete setup.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
