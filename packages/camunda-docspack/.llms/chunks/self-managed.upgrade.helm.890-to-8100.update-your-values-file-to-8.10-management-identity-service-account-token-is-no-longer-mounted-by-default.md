# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Management Identity service account token is no longer mounted by default

In chart 15.x (8.10), `identity.serviceAccount.automountServiceAccountToken` defaults to `false`, like in the other components. Management Identity doesn't call the Kubernetes API, so this change doesn't affect the application itself.

The change affects you if anything in the Management Identity pod reads the default service account token at `/var/run/secrets/kubernetes.io/serviceaccount/token`. For example:

- A sidecar or init container that you add through `identity.sidecars` or `identity.initContainers` and that calls the Kubernetes API.
- Vault Agent Injector with the Kubernetes auth method and the default token.

The change doesn't affect integrations that inject their own projected token, such as AWS IRSA, EKS Pod Identity, and Azure Workload Identity.

`helm upgrade` updates the ServiceAccount. However, running pods keep their token until Kubernetes creates them again. The change takes effect on the next pod restart or rollout. To keep the previous behavior, set:

```yaml
identity:
  serviceAccount:
    automountServiceAccountToken: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
