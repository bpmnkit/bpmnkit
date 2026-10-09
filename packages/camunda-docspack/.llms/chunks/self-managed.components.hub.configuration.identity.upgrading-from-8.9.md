# Authentication — Upgrading from 8.9

If you configured Camunda Hub authentication in 8.9, no action is required to upgrade to 8.10. Camunda Hub translates your existing settings to the settings above at startup. Those 8.9 settings are deprecated, however, and are removed in 8.11, so migrate to the `camunda.security.authentication.oidc.*` settings before upgrading to 8.11.

If you set more than one of the three 8.9 audience properties, they merge into the single `camunda.security.authentication.oidc.audiences` list. Set `camunda.security.authentication.oidc.audiences` explicitly so the resulting list is the one you intend.

For the mapping between the 8.9 and 8.10 settings, see [upgrade Camunda components from 8.9 to 8.10](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#authentication-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity
