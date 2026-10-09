# Deploy multiple Optimize instances with Helm — Clean up the releases

Remove the Optimize-only release before the platform release:

```bash
helm uninstall optimize-team-b --namespace "$NAMESPACE"
helm uninstall platform --namespace "$NAMESPACE"
```

If the Secret and namespace were created only for this deployment, remove them after both releases are gone:

```bash
kubectl delete secret multi-optimize-credentials --namespace "$NAMESPACE"
kubectl delete namespace "$NAMESPACE"
```

Helm doesn't delete indices from an external Elasticsearch or OpenSearch cluster. Retain, back up, or delete the `optimize-team-a*` and `optimize-team-b*` index families according to your datastore lifecycle policy.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
