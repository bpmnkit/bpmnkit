# Red Hat OpenShift — Requirements

- [Helm CLI v4](https://helm.sh/docs/intro/install/) (recommended; see [supported versions](https://docs.camunda.io/docs/next/reference/supported-environments#clients)).
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with the cluster.
- [jq](https://jqlang.github.io/jq/download/) to interact with some variables.
- [yq](https://github.com/mikefarah/yq/#install) to edit your `values.yml` file.
- [GNU envsubst](https://www.man7.org/linux/man-pages/man1/envsubst.1.html) to generate manifests.
- [oc (version supported by your OpenShift)](https://docs.openshift.com/container-platform/4.17/cli_reference/openshift_cli/getting-started-cli.html) to interact with OpenShift.
- A namespace to host Camunda.
- Permissions to install Kubernetes operators (cluster-admin or equivalent) for deploying the infrastructure services (Elasticsearch, PostgreSQL, Keycloak). These operators can also be installed via the [OpenShift OperatorHub](https://docs.openshift.com/container-platform/latest/operators/understanding/olm-understanding-operatorhub.html), but this guide installs them directly from source for full control over versions and configuration.

**Note: Secondary storage alternatives**
This guide includes one example path for the Orchestration Cluster's secondary storage. Depending on the guide, that example may use Elasticsearch, OpenSearch, or RDBMS.

If you use a different secondary storage backend, skip the guide-specific storage setup steps and follow [using external OpenSearch in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch) or [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

For the tool versions used, check the [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file in the repository. It contains an up-to-date list of versions that we also use for testing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
