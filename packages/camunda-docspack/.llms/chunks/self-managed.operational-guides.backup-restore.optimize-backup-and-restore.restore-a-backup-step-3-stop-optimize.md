# Back up and restore Optimize independently — Restore a backup — Step 3: Stop Optimize

Stop Optimize now, before you continue with Step 4. Only Steps 1 and 2 need Optimize running.

If you are using an external Elasticsearch/OpenSearch and Kubernetes, temporarily [uninstall](https://helm.sh/docs/helm/helm_uninstall/) the Camunda Helm chart or [scale](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_scale/) all components to 0, so that nothing is running and potentially interacting with the datastore.

With Helm, disable Optimize in `values.yml`:

```yaml
optimize:
  enabled: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
