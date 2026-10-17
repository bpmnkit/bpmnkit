# Install app integrations — Step 4: Create the configuration file — Auth configuration

The `auth` block must be configured to match the identity provider used in your environment. The `auth.kind` field selects the provider variant, which determines how OIDC discovery, token endpoints, and audience/issuer values are resolved.

Audiences are configured under `auth.audiences`. On Self-Managed, set `auth.audiences.zeebe` to the audience of your Orchestration Cluster API; App Integrations also uses it as the identity audience when requesting tokens. `auth.audiences.global` applies to SaaS only and should be omitted.

**Warning**
The singular `auth.audience` field was removed. A configuration that still uses it is rejected at startup with `auth.audience has been removed; use auth.audiences.{global,zeebe,app_integrations}`.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
