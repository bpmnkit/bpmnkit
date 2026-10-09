# Deploy multiple Optimize instances with Helm — Install the Optimize-only release

Install the second release with the exact chart version used by the platform release:

```bash
helm install optimize-team-b camunda/camunda-platform \
  --namespace "$NAMESPACE" \
  --version "$CHART_VERSION" \
  --values values-optimize-only.yaml \
  --wait
```

The second values file explicitly disables Management Identity, Camunda Hub, Web Modeler, Connectors, and the Orchestration Cluster. The release creates one Optimize Deployment plus its Service, ConfigMaps, ServiceAccount, and Ingress.

Verify that only the Optimize workload was created:

```bash
kubectl get deployments,statefulsets --namespace "$NAMESPACE" \
  --selector app.kubernetes.io/instance=optimize-team-b
```

The output must contain only the `optimize-team-b` Deployment and no StatefulSet.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
