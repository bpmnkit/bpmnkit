# Back up and restore Optimize independently — Restore a backup — Step 3: Stop Optimize

If you are using an external Elasticsearch/OpenSearch and Kubernetes, you could temporarily [uninstall](https://helm.sh/docs/helm/helm_uninstall/) the Camunda Helm chart or [scale](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_scale/) all components to 0, so that nothing is running and potentially interacting with the datastore.

In a manual setup, you can simply stop Optimize component.

If you are using the Camunda Helm chart with an embedded Elasticsearch, you can achieve this by (for example) disabling Optimize in the `values.yml`.

```yaml
elasticsearch:
  enabled: true

optimize:
  enabled: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
