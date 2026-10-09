# Install an Orchestration Cluster release — Install the release

```sh
helm install camunda camunda/camunda-platform \
  --version "$ORCHESTRATION_CHART_VERSION" \
  --namespace orchestration \
  --create-namespace \
  --values orchestration-values.yaml
```

Confirm the cluster appears in Camunda Hub's cluster list before you install its Optimize releases.


## Add another Orchestration Cluster

Add another entry to `global.topology.clusters` in the Hub release, then install another orchestration release configured to match that entry. Use unique client IDs, audiences, and secrets so each cluster has its own client registration. To also authorize users per cluster, set a distinct `components.<component>.roleName` in each record. See [role assignment across clusters](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release#role-assignment-across-clusters).

**Warning**
If orchestration releases share Elasticsearch or OpenSearch, every cluster needs its own index prefixes. Reusing a prefix mixes one cluster's records into another cluster's Operate, Tasklist, or Optimize data. See [index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants#isolate-every-index-prefix-family).

For Keycloak, Management Identity creates every declared client. For another OIDC provider, provision the clients before applying the Helm releases.

Generated internal service URLs in the Hub inventory use Kubernetes service DNS, so this pattern supports multiple namespaces in the same Kubernetes cluster. For workloads in another Kubernetes cluster, provide equivalent cross-cluster DNS and routing, or configure explicit `grpcUrl`, `restUrl`, `readinessUrl`, `operateUrl`, `tasklistUrl`, `adminUrl`, and component web application URL overrides. Set each orchestration release's `global.identity.service.url` to an address from which it can reach Management Identity.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
