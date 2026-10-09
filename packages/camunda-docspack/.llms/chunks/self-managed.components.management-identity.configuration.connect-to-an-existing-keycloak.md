# Connect to an existing Keycloak instance

Learn how to connect Management Identity to your existing Keycloak instance.

This guide describes how to connect Management Identity to your existing Keycloak instance.

**Info: Deploying with Helm?**
If you deploy Camunda 8 Self-Managed with Helm, use the [Helm chart guide for connecting to an external Keycloak instance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak) instead.


## Prerequisites

- Access to your [Keycloak Admin Console](https://www.keycloak.org/docs/latest/server_admin/#using-the-admin-console)
- A basic understanding of [administering realms and clients](https://www.keycloak.org/docs/latest/server_admin/#assembly-managing-clients_server_administration_guide) in Keycloak

**Note**
Clients in Camunda 8 SaaS and applications in Camunda 8 Self-Managed serve a similar purpose. One key difference is that for Camunda 8 SaaS, you can set up specific [client connection credentials](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-api-clients#create-a-client), whereas in Management Identity, an application is created with credentials automatically assigned.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak
