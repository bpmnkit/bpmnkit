# Red Hat OpenShift — Verify connectivity to Camunda 8 — without

This requires to port-forward the Zeebe Gateway to be able to connect to the cluster.

```shell
kubectl port-forward "services/$CAMUNDA_RELEASE_NAME-zeebe-gateway" 8080:8080 --namespace "$CAMUNDA_NAMESPACE"
```

Export the following environment variables:

```shell reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/export-verify-zeebe-local.sh
```

  

Generate a temporary token to access the Orchestration Cluster REST API, then capture the value of the `access_token` property and store it as your token. Use the stored token (referred to as `TOKEN` in this case) to interact with the Orchestration Cluster REST API and display the cluster topology:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/check-zeebe-cluster-topology.sh
```

...and results in the following output:

  Example output

```json reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/check-zeebe-cluster-topology-output.json
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
