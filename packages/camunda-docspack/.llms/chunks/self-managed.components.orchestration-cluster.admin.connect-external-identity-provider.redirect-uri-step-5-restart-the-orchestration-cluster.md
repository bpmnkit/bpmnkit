# Connect Admin to an identity provider — Redirect URI — Step 5: Restart the Orchestration Cluster

After updating your configuration, (re)start the Orchestration Cluster for the configuration changes to be applied.

A successful start does not confirm that your IdP is reachable. The cluster contacts a provider at the first request that needs it. If the cluster is up but authentication fails, see [requests fail when an identity provider is unreachable](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication#requests-fail-when-an-identity-provider-is-unreachable).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
