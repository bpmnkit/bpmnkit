# Red Hat OpenShift Dual-Region — Verify connectivity to Camunda 8

**Info: Authentication changes in 8.8+**

Starting from version 8.8, the Orchestration Cluster is configured by default with [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview) and is protected by Basic authentication using `demo:demo` as the default username and password.

The following script will port-forward the Zeebe Gateway via `kubectl` from one of your clusters. Zeebe is stretching over both clusters and is `active-active`, meaning it doesn't matter which Zeebe Gateway to use to interact with your Zeebe cluster.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/dual-region/procedure/check-zeebe-cluster-topology.sh
```

Make sure that your output contains all eight brokers from the two regions:

   
      Example output

```json reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/dual-region/procedure/check-zeebe-cluster-topology-output.json
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
