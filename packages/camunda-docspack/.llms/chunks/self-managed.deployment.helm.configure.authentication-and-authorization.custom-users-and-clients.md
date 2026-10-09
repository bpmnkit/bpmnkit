# Helm chart user and client setup for Management Identity

Configure users and OAuth2 clients for Management Identity in Camunda 8 Self-Managed deployments using the Helm chart.

When connected to Keycloak, the Camunda Helm chart allows you to configure Management Identity users and OAuth2 clients through the `identity` section in your Helm values file. This page explains how to define users and clients with YAML examples and descriptions of common fields.


## Add OAuth2 clients

Define custom OAuth2 clients under the `identity.clients` list.

Example:

```yaml
identity:
  clients:
    - id: test
      name: Test
      secret:
        existingSecret: test-secret # Kubernetes secret containing the client secret
        existingSecretKey: test-secret-key # Key inside the secret
      redirectUris: /dummy # Redirect URIs for the OAuth2 client
      rootUrl: http://dummy # Root URL of the client application
      type: confidential # Client type (confidential, public, m2m)
      permissions:
        - resourceServerId: camunda-identity-resource-server
          definition: read
        - resourceServerId: camunda-identity-resource-server
          definition: write
        - resourceServerId: orchestration-api
          definition: read:*
        - resourceServerId: orchestration-api
          definition: write:*
        - resourceServerId: optimize-api
          definition: write:*
        - resourceServerId: web-modeler-api
          definition: write:*
        - resourceServerId: console-api
          definition: write:*
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/custom-users-and-clients
