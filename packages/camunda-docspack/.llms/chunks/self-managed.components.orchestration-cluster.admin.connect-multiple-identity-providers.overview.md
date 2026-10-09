# Connect to multiple identity providers — Overview

When multiple OIDC providers are set up, the cluster login page lets users select the provider they wish to use. For API access, any bearer token issued by one of the configured and trusted issuers is accepted; all others are denied.


## Prerequisites

- Camunda 8 Orchestration Cluster (Self-Managed) deployed.
- At least two OIDC-compliant IdPs (for example, Microsoft Entra ID, Keycloak, Okta).
- Administrative access to each IdP (to register applications and obtain credentials).


## Configure multiple identity providers

Configure multiple IdPs by defining each provider as a separate registration in `application.yaml` or using environment variables.

Each provider is identified by a unique `<provider-id>`, which is a user-defined label (e.g., `ENTRA`, `KEYCLOAK`, `PARTNER_X`).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers
