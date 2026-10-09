# Dual-region setup (EKS) — 4. Verify connectivity to Camunda 8

**Info: Authentication changes in 8.8+**

Starting from version 8.8, the Orchestration Cluster is configured by default with [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview) and is protected by Basic authentication using `demo:demo` as the default username and password.

1. Open a terminal and port-forward the Zeebe Gateway via `kubectl` from one of your clusters. Zeebe is stretching over both clusters and is `active-active`, meaning it doesn't matter which Zeebe Gateway to use to interact with your Zeebe cluster.

```bash
kubectl --context "$CLUSTER_0" -n $CAMUNDA_NAMESPACE_0 port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 8080:8080
```

2. Open another terminal and use e.g. `cURL` to print the Zeebe cluster topology:

```
# authentication may vary depending on your setup, the following is just an example call.
curl -u demo:demo -L -X GET 'http://localhost:8080/v2/topology' \
  -H 'Accept: application/json'
```

3. Make sure that your output contains all eight brokers from the two regions:

  Example output

```json reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/dual-region/procedure/check-zeebe-cluster-topology-output.json
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
