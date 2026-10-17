# Manage cluster settings — Authorizations

You can enable authorizations on a per-cluster basis to control the level of access users and clients have over Orchestration Cluster resources.

- Enable this setting to use [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) in the cluster.
- Disable this setting if you do not want to use authorizations in the cluster. You can still configure authorizations in the Orchestration Cluster Admin, but they are only applied to the cluster when you enable this setting.

**Tip**
Learn more about [resource-based authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).


## External identity provider

You can register one custom OpenID Connect (OIDC) identity provider for a cluster, alongside Camunda's built-in provider, so your users can sign in with your organization's own IdP.

- Enable this setting after you configure a provider, to let users sign in through it.
- Disable this setting to fall back to Camunda's built-in provider only. Your configuration and client secret are retained so you can re-enable it later without entering them again.

This setting requires a cluster on Camunda 8.10.1 or any later version. Only organization admins can change it. Enabling or disabling this setting restarts your cluster.

For setup steps, a field reference, and known limitations, see [connect an external identity provider](https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/settings
