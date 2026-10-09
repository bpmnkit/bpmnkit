# Red Hat OpenShift — Verify connectivity to Camunda 8 — with

The following values are required for the OAuth authentication:

- **Cluster endpoint:** `https://zeebe-$CAMUNDA_DOMAIN`, replacing `$CAMUNDA_DOMAIN` with your domain
- **Client ID:** Retrieve the client ID value from the identity page of your created M2M application
- **Client Secret:** Retrieve the client secret value from the Identity page of your created M2M application
- **OAuth Token URL:** Your IdP's token endpoint (for example, `https://$CAMUNDA_DOMAIN/auth/realms/camunda-platform/protocol/openid-connect/token` when using Keycloak), replacing `$CAMUNDA_DOMAIN` with your domain
- **Audience:** `orchestration-api`, the default for Camunda 8 Self-Managed

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
