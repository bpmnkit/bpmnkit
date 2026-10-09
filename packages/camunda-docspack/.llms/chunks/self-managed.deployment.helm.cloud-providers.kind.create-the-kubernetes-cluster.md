# Deploy Camunda 8 to a local kind cluster — Create the Kubernetes cluster

First, run the cluster creation script:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/cluster-create.sh
```

This script:

1. Creates a kind cluster named `camunda-platform-local`.
2. Waits until all nodes are ready.
3. Creates the `camunda` namespace.

In the output, you should see three nodes in `Ready` state.

Review the cluster configuration

The cluster includes one control plane node and two worker nodes with HTTP (80) and HTTPS (443) port mappings for Ingress:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/configs/kind-cluster-config.yaml
```

Now that you've created the cluster, you'll need to choose a deployment mode for the next steps:

- [Domain mode](#domain-mode-deployment)
- [No-domain mode](#no-domain-mode-deployment)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
