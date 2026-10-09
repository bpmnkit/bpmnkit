# Deploy multiple Optimize instances with Helm — Troubleshoot the deployment

Use these commands to inspect both releases:

```bash
helm get values platform --namespace "$NAMESPACE"
helm get values optimize-team-b --namespace "$NAMESPACE"
kubectl get pods,services,ingresses --namespace "$NAMESPACE"
kubectl logs --namespace "$NAMESPACE" deployment/platform-optimize
kubectl logs --namespace "$NAMESPACE" deployment/optimize-team-b
```

| Symptom                                                 | Check                                                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| The second Optimize pod can't reach Management Identity | Confirm `global.identity.service.url` resolves to `http://platform-identity:80/identity` and the platform Identity endpoints are ready.            |
| Login returns an invalid redirect URI                   | Compare `optimize.contextPath`, `global.identity.auth.optimize.redirectUrl`, the custom client's `rootUrl`, and the Keycloak callback URI.         |
| Both URLs use the same client ID                        | Confirm each release received the intended values file and inspect `application-ccsm.yaml` in its Optimize ConfigMap.                              |
| One path returns 404                                    | Confirm both Ingress objects use the same host and Ingress class, have distinct paths, and are reconciled by `ingress-nginx`.                      |
| The second release creates unrelated workloads          | Confirm `values-optimize-only.yaml` is the final values layer and that no later file enables components.                                           |
| Optimize starts but doesn't show process data           | Confirm both releases use the same datastore and `zeebe-record` prefix, and check the legacy exporter and Optimize importer logs.                  |
| Optimize-owned indices overlap                          | Confirm the two `CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` or OpenSearch prefix values are distinct and weren't changed after startup. |

Don't add hand-written Deployments, Services, Ingresses, or `global.extraManifests` to repair a mismatch. Correct the supported chart values and run `helm upgrade` for the affected release.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
