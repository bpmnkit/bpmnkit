# Move from a combined release to the split topology — Keep the cluster in place — Step 3: Install the Hub release against the existing databases

Install the Hub release from the `hub-values.yaml` you prepared in step 1. Follow [install the Hub release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release), and install into a new namespace. Don't reuse the orchestration release's namespace.

Project the workload client secrets into the Hub namespace as well. Kubernetes Secrets are namespace-scoped.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
