# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Management Identity service account token is no longer mounted by default

In chart 15.x (8.10), `identity.serviceAccount.automountServiceAccountToken` defaults to `false`, matching the other components. Management Identity does not call the Kubernetes API, so the application itself is not affected.

You are affected if anything in the Management Identity pod reads the default service account token at `/var/run/secrets/kubernetes.io/serviceaccount/token`, for example:

- A sidecar or init container added through `identity.sidecars` or `identity.initContainers` that calls the Kubernetes API.
- Vault Agent Injector using the Kubernetes auth method with the default token.

Integrations that inject their own projected token, such as AWS IRSA, EKS Pod Identity, and Azure Workload Identity, are not affected.

The ServiceAccount is updated during `helm upgrade`, but running pods keep their token until they are recreated. The change takes effect on the next pod restart or rollout. To keep the previous behavior, set:

```yaml
identity:
  serviceAccount:
    automountServiceAccountToken: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
