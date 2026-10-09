# Get started with the catalog — Connect the repository to Hub — Provide credentials and configuration

Create and store client credentials securely—for example, as CI/CD secrets—and expose them with environment-specific URLs as environment variables. The token issuer and the Camunda Hub API base URL differ between SaaS and Self-Managed:

1. [Create new client credentials](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/authentication#create-new-client-credentials) with the Hub API `create` and `update` permissions.
2. Securely store the `Client ID` and `Client Secret`. The client secret is only shown once. In a pipeline, store them as CI/CD secrets, such as [GitHub Actions secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions), and reference them from your workflow instead of hardcoding them.
3. Expose the following environment variables in your pipeline:

```bash
export CAMUNDA_CONSOLE_CLIENT_ID="<client-id>"
export CAMUNDA_CONSOLE_CLIENT_SECRET="<client-secret>"
export CAMUNDA_OAUTH_URL="https://login.cloud.camunda.io/oauth/token"
export CAMUNDA_CONSOLE_OAUTH_AUDIENCE="api.cloud.camunda.io"
```

The sync script defaults `CAMUNDA_HUB_BASE_URL` to the SaaS URL (`https://hub.camunda.io`), so you don't need to set it for SaaS.

In Self-Managed, tokens are issued by your [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/authentication) instance, and the Camunda Hub API is served from your own installation.

1. [Create new client credentials](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/authentication#create-a-new-application) with the Hub API `create` and `update` permissions.
2. Securely store the application's `Client ID` and `Client Secret`.
3. Expose the following environment variables in your pipeline:

```bash
export CAMUNDA_CONSOLE_CLIENT_ID="<client-id>"
export CAMUNDA_CONSOLE_CLIENT_SECRET="<client-secret>"
export CAMUNDA_OAUTH_URL="http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token"
export CAMUNDA_HUB_BASE_URL="http://localhost:8088"
```

The URLs used in this example are local defaults, for example, `http://localhost:8088` for the API. In a Helm/Kubernetes deployment, use the service or Ingress host configured for Camunda Hub instead. Adjust all URLs to match your installation. You must set `CAMUNDA_HUB_BASE_URL`, as the sync script defaults it to the SaaS URL.

**Note**
This authorization also adds the required `web-modeler-public-api` audience to tokens issued for this application, so no `CAMUNDA_CONSOLE_OAUTH_AUDIENCE` is needed to request a token during the sync.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
